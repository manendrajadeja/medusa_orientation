// src/jobs/sync-products.ts
// Production-ready product sync job

import { MedusaContainer } from "@medusajs/framework/types"
import { batchProductsWorkflow, createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import { Modules } from "@medusajs/framework/utils"

type DummyProduct = {
  id: number
  title: string
  description: string
  price: number
  category?: string
  thumbnail?: string
  images?: string[]
  discountPercentage?: number
  rating?: number
  stock?: number
  brand?: string
  weight?: number
  sku?: string
  warrantyInformation?: string
  shippingInformation?: string
  availabilityStatus?: string
  reviews?: any[]
  returnPolicy?: string
  minimumOrderQuantity?: number
  meta?: any
  tags?: string[]
}

const DUMMY_API_BASE = "https://dummyjson.com/products"
const PAGE_LIMIT = 30
const DEFAULT_BATCH_SIZE = Number(process.env.SYNC_PRODUCTS_BATCH_SIZE) || 15
const DEFAULT_MAX_RETRIES = Number(process.env.SYNC_PRODUCTS_MAX_RETRIES) || 2
const DRY_RUN = process.env.SYNC_PRODUCTS_DRY_RUN === "true"
const VERBOSE = process.env.SYNC_PRODUCTS_VERBOSE === "true"
// Run every 2 minutes by default (can be overridden via SYNC_PRODUCTS_SCHEDULE)
const DEFAULT_SCHEDULE = process.env.SYNC_PRODUCTS_SCHEDULE || "*/2 * * * *" // every 2 minutes
// Default max retries for network/workflow operations is 2 (can be overridden via SYNC_PRODUCTS_MAX_RETRIES)
const PAGE_DELAY_MS = Number(process.env.SYNC_PRODUCTS_PAGE_DELAY_MS) || 0

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export async function fetchWithRetry(url: string, opts: RequestInit = {}, maxRetries = DEFAULT_MAX_RETRIES) {
  let attempt = 0
  const baseDelay = 500
  // Use global fetch (Node 18+) or fall back to node-fetch if available
  const _fetch = (global as any).fetch || (await import("node-fetch")).default

  while (true) {
    try {
      const res = await _fetch(url, opts)
      if (res.ok) return res
      // Retry on 429/502/503/504
      if ([429, 502, 503, 504].includes(res.status)) {
        throw new Error(`Transient HTTP error ${res.status}`)
      }
      // Non-retryable HTTP error
      const text = await res.text().catch(() => "")
      const err: any = new Error(`Fetch failed ${res.status}: ${text}`)
      err.status = res.status
      throw err
    } catch (err: any) {
      attempt += 1
      const isTransient = attempt <= maxRetries
      if (!isTransient) throw err
      const jitter = Math.floor(Math.random() * 500)
      const wait = baseDelay * Math.pow(2, attempt - 1) + jitter
      console.warn(`fetchWithRetry: attempt ${attempt} failed, retrying in ${wait}ms: ${err?.message}`)
      await sleep(wait)
    }
  }
}

export async function fetchTotalCount() {
  const url = `${DUMMY_API_BASE}?limit=1&skip=0`
  const res = await fetchWithRetry(url)
  const json = await res.json()
  return Number(json.total ?? 0)
}

export async function* fetchAllProducts() {
  let skip = 0
  let total = Infinity

  while (skip < total) {
    const url = `${DUMMY_API_BASE}?limit=${PAGE_LIMIT}&skip=${skip}`
    const res = await fetchWithRetry(url)
    const json = await res.json()
    const products: DummyProduct[] = json.products ?? []
    total = json.total ?? products.length
    if (!products.length) break
    for (const p of products) {
      yield p
    }
    const pageLimit = json.limit ?? products.length ?? PAGE_LIMIT
    skip += pageLimit
    // Respect optional page delay to avoid rate-limits
    if (PAGE_DELAY_MS > 0) await sleep(PAGE_DELAY_MS)
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") // collapse dashes
}

export function mapProductToMedusaSchema(product: DummyProduct) {
  const handle = slugify(product.title)

  // If product has no explicit options, we create a default option so the product
  // passes Medusa's validation step (validateProductInputStep requires product options).
  const defaultOption = { title: "Default", values: ["Default"] }

  // Use images, fallback to thumbnail if empty
  let images: { url: string }[] = []
  if (product.images && product.images.length > 0) {
    images = product.images.map((src) => ({ url: src }))
  } else if (product.thumbnail) {
    images = [{ url: product.thumbnail }]
  }

  // Calculate review stats if available (dummyjson products have 'rating' and 'reviews' array usually)
  const reviewCount = product.reviews ? product.reviews.length : 0
  const reviewAverage = product.rating || 0

  const mapped: any = {
    title: product.title,
    description: product.description,
    handle,
    status: "published",
    metadata: {
      external_id: String(product.id),
      external_category: product.category,
      external_rating: String(reviewAverage),
      reviews_count: reviewCount
    },
    options: [defaultOption],
    variants: [
      {
        title: "Default",
        // Map variant option values to match `options` above
        options: { [defaultOption.title]: defaultOption.values[0] },
        prices: [
          {
            amount: Math.round(product.price * 100),
            currency_code: "usd",
          },
        ],
      },
    ],
    images,
  }

  return mapped
}

export async function* batched<T>(iterable: AsyncIterable<T>, batchSize = DEFAULT_BATCH_SIZE) {
  let batch: T[] = []
  for await (const item of iterable) {
    batch.push(item)
    if (batch.length >= batchSize) {
      yield batch
      batch = []
    }
  }
  if (batch.length) yield batch
}

async function retryWorkflowRun<T extends any>(fn: () => Promise<T>, maxRetries = DEFAULT_MAX_RETRIES) {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (err: any) {
      attempt += 1
      if (attempt > maxRetries) throw err
      const wait = 500 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 500)
      console.warn(`Workflow run failed, retrying in ${wait}ms (attempt ${attempt}): ${err?.message}`)
      await sleep(wait)
    }
  }
}

// Category Sync Logic
async function fetchCategories() {
  const url = "https://dummyjson.com/products/categories"
  const res = await fetchWithRetry(url)
  const json = await res.json()
  // json is array of { slug, name, url }
  return json as { slug: string, name: string, url: string }[]
}

async function syncCategories(container: MedusaContainer) {
  console.log("Syncing categories via Workflow...")
  const rawCategories = await fetchCategories()
  const categoriesToCreate: any[] = []

  // Check existing
  let existingHandles: Set<string> = new Set()
  try {
    const remoteQuery = container.resolve("remoteQuery")
    // @ts-ignore
    const query = {
      entryPoint: "product_category",
      fields: ["handle"],
      variables: { limit: 1000 }
    }
    const res = await remoteQuery(query)
    const rows = Array.isArray(res) ? res : (res.rows || res.data || [])
    rows.forEach((r: any) => existingHandles.add(r.handle))
  } catch (e) {
    console.warn("Could not fetch existing categories:", e)
  }

  for (const cat of rawCategories) {
    if (!existingHandles.has(cat.slug)) {
      categoriesToCreate.push({
        name: cat.name,
        handle: cat.slug,
        metadata: { url: cat.url, synced_from: "dummyjson" }
      })
    }
  }

  if (categoriesToCreate.length > 0) {
    console.log(`Creating ${categoriesToCreate.length} new categories...`)
    if (DRY_RUN) {
      console.log("DRY RUN: Skipping category creation.")
    } else {
      try {
        // Use createProductCategoriesWorkflow
        const { result } = await createProductCategoriesWorkflow(container).run({
          input: { product_categories: categoriesToCreate }
        })
        console.log(`Created ${result.length} categories.`)
      } catch (e: any) {
        console.error("Failed to create categories:", e?.message || e)
      }
    }
  } else {
    console.log("All categories already exist.")
  }
}

// Enhanced query to find products by External ID OR Handle
async function queryExistingProducts(container: MedusaContainer, externalIds: string[], handles: string[]) {
  const products: any[] = []

  // Attempt 1: Repository Query (fastest)
  try {
    const productRepository = container.resolve("productRepository") as any
    if (productRepository && typeof productRepository.createQueryBuilder === "function") {
      const qb = productRepository.createQueryBuilder("p")
      qb.where("p.metadata ->> 'external_id' IN (:...ids)", { ids: externalIds })
      qb.orWhere("p.handle IN (:...handles)", { handles })
      return await qb.getMany()
    }
  } catch (err) {
    // Repository access failed
  }

  // Attempt 2: Remote Query (Medusa v2 standard)
  try {
    const remoteQuery = container.resolve("remoteQuery")
    if (remoteQuery) {
      // Query by handle
      const query = {
        entryPoint: "product",
        fields: ["id", "handle", "metadata"],
        variables: {
          filters: { handle: handles }
        }
      }
      const result = await remoteQuery(query)
      const byHandle = Array.isArray(result) ? result : (result.rows || result.data || [])

      if (Array.isArray(byHandle)) {
        products.push(...byHandle)
      }
    }
  } catch (err) {
    console.warn("Could not query existing products via remoteQuery:", err)
  }

  // Attempt 3: Legacy Service (fallback)
  if (products.length === 0) {
    try {
      const key = Modules.PRODUCT
      const productService = container.resolve(key) as any
      // Check for listProducts (v2 module) or list (v1 service)
      const listFn = productService.listProducts || productService.list
      if (typeof listFn === "function") {
        const byHandles = await listFn.bind(productService)({ handle: handles }, { take: handles.length })
        products.push(...byHandles)
      }
    } catch (err) {
      // ignore
    }
  }

  return products
}

export default async function syncProductsJob(maybeContainer?: any) {
  console.log("Starting product sync...")

  // Normalize container: medusa exec sometimes injects a lightweight object.
  let container: any = maybeContainer
  if (!container || typeof container.resolve !== "function") {
    if (maybeContainer && maybeContainer.container && typeof maybeContainer.container.resolve === "function") {
      container = maybeContainer.container
    } else {
      try {
        const mod = await import("@medusajs/medusa") as any
        const createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod
        if (typeof createContainerFn === "function") {
          container = await createContainerFn()
        }
      } catch (e) {
        console.warn("Could not create a full Medusa container;", e?.message || e)
      }
    }
  }

  // 1. Sync Categories first
  if (container) {
    await syncCategories(container).catch(err => console.error("Category sync failed non-fatally:", err))
  } else {
    console.warn("Skipping category sync: Use 'medusa exec' with a valid container.")
  }

  // Clamp configured batch size into the recommended range (10-20)
  const requestedBatchSize = Number(process.env.SYNC_PRODUCTS_BATCH_SIZE) || DEFAULT_BATCH_SIZE
  const batchSize = Math.max(10, Math.min(20, requestedBatchSize))
  if (requestedBatchSize !== batchSize) {
    console.warn(`SYNC_PRODUCTS_BATCH_SIZE=${requestedBatchSize} adjusted to ${batchSize} to keep batch size within 10-20`)
  }
  const createCount = { created: 0, updated: 0 }
  const syncedProducts: any[] = []

  // Progress tracking
  const totalProducts = await fetchTotalCount().catch((e) => {
    console.warn("Failed to fetch total product count, progress will be relative.", e?.message || e)
    return null
  })

  try {
    const productsStream = fetchAllProducts()

    let processed = 0
    for await (const page of batched(productsStream, batchSize)) {
      const externalIds = page.map((p) => String(p.id))
      // Map temporary to get handles to query
      const handlesToCheck = page.map(p => slugify(p.title))

      processed += page.length
      const percent = totalProducts ? ((processed / totalProducts) * 100).toFixed(1) : undefined
      console.log(`Processing batch of ${page.length} products (externalIds: ${externalIds.slice(0, 5).join(',')}${externalIds.length > 5 ? '...' : ''})${percent ? ` — progress: ${percent}%` : ''}`)

      // Query existing by ID or Handle
      const existing = await queryExistingProducts(container, externalIds, handlesToCheck)

      const byExternal: Record<string, any> = {}
      const byHandle: Record<string, any> = {}

      for (const e of existing) {
        if (e.metadata?.external_id) {
          byExternal[String(e.metadata.external_id)] = e
        }
        if (e.handle) {
          byHandle[e.handle] = e
        }
      }

      const toCreate: any[] = []
      const toUpdate: any[] = []

      for (const item of page) {
        const mapped = mapProductToMedusaSchema(item)
        const extId = String(item.id)
        const handle = mapped.handle

        let match = byExternal[extId]
        if (!match && byHandle[handle]) {
          match = byHandle[handle]
        }

        if (match) {
          toUpdate.push({ id: match.id, ...mapped })
        } else {
          toCreate.push(mapped)
        }
      }

      console.log(`Batch split → create=${toCreate.length}, update=${toUpdate.length}`)

      if (DRY_RUN) {
        console.log(`DRY RUN enabled — skipping workflow. create: ${toCreate.length}, update: ${toUpdate.length}`)
        createCount.created += toCreate.length
        createCount.updated += toUpdate.length
        continue
      }

      // run workflow with retry
      const run = async () => {
        const { result } = await batchProductsWorkflow(container).run({
          input: { create: toCreate.length ? toCreate : undefined, update: toUpdate.length ? toUpdate : undefined },
        })
        return result
      }

      try {
        await retryWorkflowRun(run)
        createCount.created += toCreate.length
        createCount.updated += toUpdate.length

        // Collect for CSV
        for (const p of toCreate) syncedProducts.push({ ...p, _status: 'created' })
        for (const p of toUpdate) syncedProducts.push({ ...p, _status: 'updated' })

        console.log(`Batch processed: created=${toCreate.length}, updated=${toUpdate.length}`)
      } catch (err: any) {
        console.error(`Batch failed after retries: ${err?.message}`)
      }
    }

    console.log(`Product sync completed. created=${createCount.created} updated=${createCount.updated}`)

    // Generate and save CSV
    if (syncedProducts.length > 0) {
      try {
        const fs = await import("fs/promises")
        const path = await import("path")
        const exportDir = path.resolve(process.cwd(), "exports")
        await fs.mkdir(exportDir, { recursive: true })

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
        const filename = `products-sync-${timestamp}.csv`
        const filePath = path.join(exportDir, filename)

        const csvContent = [
          "External ID,Handle,Title,Status,Action",
          ...syncedProducts.map(p => {
            const extId = p.metadata?.external_id || ""
            // escape commas in title
            const title = String(p.title).replace(/"/g, '""')
            return `${extId},${p.handle},"${title}",${p.status},${p._status}`
          })
        ].join("\n")

        await fs.writeFile(filePath, csvContent)
        console.log(`Exported sync details to: ${filePath}`)
      } catch (e) {
        console.error("Failed to export CSV:", e)
      }
    }

  } catch (err: any) {
    console.error(`Product sync job failed: ${err?.message}`)
    throw err
  }
}

export const config = {
  name: "sync-products",
  schedule: DEFAULT_SCHEDULE,
}
