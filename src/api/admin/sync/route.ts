import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import syncProductsJob from "../../../jobs/sync-products"

// GET /admin/sync/dummyjson
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const container = req.scope

  // Use repository queries to find categories and collections with metadata.synced_from = 'dummyjson'
  let categories = []
  let collections = []
  try {
    const catRepo = container.resolve("categoryRepository") as any
    const qbCat = catRepo.createQueryBuilder("c")
    qbCat.where("c.metadata ->> 'synced_from' = :src", { src: "dummyjson" })
    const categoryRows = await qbCat.getMany()
    categories = categoryRows.map((c: any) => ({ id: c.id, name: c.name, handle: c.handle, metadata: c.metadata }))
  } catch (e) {
    console.warn("categoryRepository not available in current runtime; cannot list categories via API.", e?.message || e)
  }

  try {
    const collRepo = container.resolve("productCollectionRepository") as any
    const qbColl = collRepo.createQueryBuilder("p")
    qbColl.where("p.metadata ->> 'synced_from' = :src", { src: "dummyjson" })
    const collectionRows = await qbColl.getMany()
    collections = collectionRows.map((c: any) => ({ id: c.id, title: c.title, handle: c.handle, metadata: c.metadata }))
  } catch (e) {
    console.warn("productCollectionRepository not available in current runtime; cannot list collections via API.", e?.message || e)
  }

  res.json({ categories, collections })
}

// POST /admin/sync/dummyjson -> trigger a sync run (async)
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const container = req.scope
    // kick off sync in background
    ; (async () => {
      try {
        await syncProductsJob(container)
      } catch (e) {
        console.error("Background sync failed:", e)
      }
    })()

  res.status(202).json({ status: "accepted" })
}

export const AUTHENTICATE = false
