import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"

export default async function missingProducts(maybeContainer?: any) {
  // normalize container: medusa exec may not pass a full container, so create one if needed
  let container: any = maybeContainer
  try {
    // debug shape of the provided arg
    console.log("missing-products: received arg type=", typeof maybeContainer)
    if (maybeContainer && typeof maybeContainer === "object") {
      console.log("missing-products: arg keys=", Object.keys(maybeContainer))
    }
  } catch (e) {
    // ignore
  }

  if (!container || typeof container.resolve !== "function") {
    // medusa exec passes an object with shape { container, args }
    if (maybeContainer && maybeContainer.container && typeof maybeContainer.container.resolve === "function") {
      container = maybeContainer.container
    } else {
      // try to use medusa's runtime to create a container but fallback gracefully
      const mod = await import("@medusajs/medusa") as any
      let createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod
      if (typeof createContainerFn === "function") {
        container = await createContainerFn()
      } else if (mod && mod.app && typeof mod.app.createContainer === "function") {
        container = await mod.app.createContainer()
      } else {
        console.warn("Could not resolve createContainer; proceeding may fail if no DB access is available")
      }
    }
  }

  // Fetch all dummy product IDs
  const fetch = (global as any).fetch || (await import("node-fetch")).default
  const base = "https://dummyjson.com/products"

  const ids: string[] = []
  let skip = 0
  const limit = 100
  while (true) {
    const res = await fetch(`${base}?limit=${limit}&skip=${skip}`)
    const json = await res.json()
    const products = json.products ?? []
    for (const p of products) ids.push(String(p.id))
    if (!products.length) break
    skip += limit
  }

  // Ensure we have a container with productRepository; if not, try to create a full container
  try {
    container.resolve("productRepository")
  } catch (e) {
    console.log("Current container lacks productRepository; available registrations (sample):", Object.keys(container.registrations || {}).slice(0,20))
    console.log("Attempting to create a full container for DB access...")
    const mod = await import("@medusajs/medusa") as any
    let createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod
    if (typeof createContainerFn === "function") {
      container = await createContainerFn()
    } else if (mod && mod.app && typeof mod.app.createContainer === "function") {
      container = await mod.app.createContainer()
    } else {
      console.log("Could not obtain a full container; trying to use productService if available.")
    }
  }

  // Try productRepository first; fall back to productService
  let existingIds: string[] = []
  try {
    const prodRepo = container.resolve("productRepository") as any
    const qb = prodRepo.createQueryBuilder("p")
    qb.select("p.metadata ->> 'external_id'", "external_id")
    qb.where("p.metadata ->> 'external_id' IS NOT NULL")
    const rows = await qb.getRawMany()
    existingIds = rows.map((r: any) => String(r.external_id))
  } catch (e) {
    console.warn("productRepository not available; falling back to productService.list() if available", e?.message || e)
    try {
      const prodSvc = container.resolve("productService") as any
      if (prodSvc && typeof prodSvc.list === "function") {
        const res = await prodSvc.list({ take: 1000 })
        existingIds = res.map((r: any) => String(r.metadata?.external_id)).filter(Boolean)
      }
    } catch (e2) {
      console.error("Could not obtain existing products from repository or service: " + (e2?.message || e2))
      console.error(
        "Note: The medusa exec environment doesn't expose repositories/services. Run this script directly with a full Medusa container: `npx ts-node src/scripts/missing-products.ts` or `node -r ts-node/register src/scripts/missing-products.ts`"
      )
      process.exit(1)
    }
  }

  const existing = new Set(existingIds)

  const missing = ids.filter((id) => !existing.has(id))
  console.log(`Found ${missing.length} missing products.`)
  if (!missing.length) {
    console.log("No missing products — all good.")
    return
  }

  const outPath = path.resolve(process.cwd(), "tmp/missing-products.json")
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true })
  await fs.promises.writeFile(outPath, JSON.stringify(missing, null, 2))

  console.log(`Wrote missing product ids to ${outPath}. Sample:`)
  console.log(missing.slice(0, 20))
}

if (require.main === module) {
  ;(async () => {
    const { createContainer } = await import("@medusajs/medusa")
    const container = await createContainer()
    await missingProducts(container)
    process.exit(0)
  })()
}
