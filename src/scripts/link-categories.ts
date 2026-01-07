import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"

async function ensureContainer(maybeContainer?: any) {
  let container: any = maybeContainer
  if (!container || typeof container.resolve !== "function") {
    if (maybeContainer && maybeContainer.container && typeof maybeContainer.container.resolve === "function") {
      container = maybeContainer.container
    } else {
      const mod = await import("@medusajs/medusa") as any
      let createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod
      if (typeof createContainerFn === "function") {
        container = await createContainerFn()
      } else if (mod && mod.app && typeof mod.app.createContainer === "function") {
        container = await mod.app.createContainer()
      } else {
        throw new Error("Could not obtain a Medusa container with DB access")
      }
    }
  }
  return container as MedusaContainer
}

async function fetchAllDummyProducts() {
  const fetch = (global as any).fetch || (await import("node-fetch")).default
  const base = "https://dummyjson.com/products"
  const ids: any[] = []
  let skip = 0
  const limit = 100
  while (true) {
    const res = await fetch(`${base}?limit=${limit}&skip=${skip}`)
    const json = await res.json()
    const products = json.products ?? []
    for (const p of products) ids.push(p)
    if (!products.length) break
    skip += limit
  }
  return ids
}

async function findOrCreateCategory(container: MedusaContainer, name: string) {
  const repo = container.resolve("categoryRepository") as any
  if (repo && typeof repo.createQueryBuilder === "function") {
    const qb = repo.createQueryBuilder("c")
    qb.where("LOWER(c.name) = :name", { name: name.toLowerCase() })
    const found = await qb.getOne()
    if (found) return found
  }

  try {
    const svc = container.resolve("categoryService") as any
    if (svc && typeof svc.create === "function") {
      const created = await svc.create({ name, handle: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") })
      return created
    }
  } catch (e) {
    // fallback
  }

  // repository fallback
  const row = repo.create({ name, handle: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") })
  return await repo.save(row)
}

async function findProductByExternalId(container: MedusaContainer, externalId: string) {
  const repo = container.resolve("productRepository") as any
  const qb = repo.createQueryBuilder("p")
  qb.where("p.metadata ->> 'external_id' = :id", { id: externalId })
  qb.leftJoinAndSelect("p.categories", "c")
  const prod = await qb.getOne()
  if (prod) return prod

  // fallback to productService
  try {
    const svc = container.resolve("productService") as any
    if (svc && typeof svc.retrieveByExternalId === "function") {
      // some services may implement convenience method
      return await svc.retrieveByExternalId(externalId)
    }
    if (svc && typeof svc.list === "function") {
      // naive fallback
      const res = await svc.list({ take: 1000 })
      return res.find((r: any) => String(r.metadata?.external_id) === externalId)
    }
  } catch (e) {
    // ignore
  }
  return null
}

export default async function linkCategories(containerArg?: any) {
  const container = await ensureContainer(containerArg)
  const dryRun = process.env.SYNC_CATEGORIES_DRY_RUN === "true"

  const products = await fetchAllDummyProducts()
  const uniqueCategories = new Set<string>()
  for (const p of products) if (p.category) uniqueCategories.add(String(p.category).trim())
  console.log(`Found ${products.length} remote products and ${uniqueCategories.size} unique categories.`)

  // ensure all categories exist
  const nameToCategory: Record<string, any> = {}
  for (const name of Array.from(uniqueCategories)) {
    try {
      const cat = await findOrCreateCategory(container, name)
      nameToCategory[name.toLowerCase()] = cat
      console.log(`Category: ${name} -> id=${cat.id}`)
    } catch (e: any) {
      console.error(`Failed to ensure category '${name}': ${e?.message || e}`)
    }
  }

  const report: any[] = []

  for (const p of products) {
    const ext = String(p.id)
    const catName = String(p.category || "").trim()
    if (!catName) continue
    const cat = nameToCategory[catName.toLowerCase()]
    if (!cat) {
      report.push({ external_id: ext, status: "category_missing", category: catName })
      continue
    }

    const prod = await findProductByExternalId(container, ext)
    if (!prod) {
      report.push({ external_id: ext, status: "product_missing", category: catName })
      continue
    }

    const currentCats = (prod.categories ?? []).map((c: any) => String(c.id))
    if (currentCats.includes(String(cat.id))) {
      report.push({ external_id: ext, product_id: prod.id, status: "already_linked", category: catName })
      continue
    }

    if (dryRun) {
      report.push({ external_id: ext, product_id: prod.id, status: "dry_run_would_link", category: catName, category_id: cat.id })
      continue
    }

    // attempt to link via productService.update or repository
    try {
      const prodSvc = container.resolve("productService") as any
      if (prodSvc && typeof prodSvc.update === "function") {
        const newCats = (prod.categories ?? []).map((c: any) => ({ id: c.id }))
        newCats.push({ id: cat.id })
        await prodSvc.update(prod.id, { categories: newCats })
      } else {
        // repository fallback: set relations directly (simple approach)
        const repo = container.resolve("productRepository") as any
        prod.categories = [...(prod.categories ?? []), { id: cat.id }]
        await repo.save(prod)
      }

      report.push({ external_id: ext, product_id: prod.id, status: "linked", category: catName, category_id: cat.id })
      console.log(`Linked product ${prod.id} (external=${ext}) -> category ${catName} (id=${cat.id})`)
    } catch (e: any) {
      console.error(`Failed linking product external=${ext} to category '${catName}': ${e?.message || e}`)
      report.push({ external_id: ext, product_id: prod.id, status: "link_failed", category: catName, error: e?.message || String(e) })
    }
  }

  const out = path.resolve(process.cwd(), "tmp/category-link-report.json")
  await fs.promises.mkdir(path.dirname(out), { recursive: true })
  await fs.promises.writeFile(out, JSON.stringify(report, null, 2))
  console.log(`Wrote report to ${out}. Summary: total=${report.length} entries.`)
}

if (require.main === module) {
  ;(async () => {
    try {
      const { createContainer } = await import("@medusajs/medusa")
      const container = await createContainer()
      await linkCategories(container)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
    process.exit(0)
  })()
}
