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
    const remoteQuery = container.resolve("remoteQuery")

    // Fetch Categories
    const catQuery = {
      entryPoint: "product_category",
      fields: ["id", "name", "handle", "metadata"],
      variables: {
        filters: {
          metadata: { synced_from: "dummyjson" }
        },
        limit: 1000
      }
    }
    const catResult = await remoteQuery(catQuery)
    categories = Array.isArray(catResult) ? catResult : (catResult.rows || catResult.data || [])

    // Fetch Collections
    const collQuery = {
      entryPoint: "product_collection",
      fields: ["id", "title", "handle", "metadata"],
      variables: {
        filters: {
          metadata: { synced_from: "dummyjson" }
        },
        limit: 1000
      }
    }
    const collResult = await remoteQuery(collQuery)
    collections = Array.isArray(collResult) ? collResult : (collResult.rows || collResult.data || [])

    // Fetch Last Synced Time (latest updated_at of a synced product)
    const lastSyncQuery = {
      entryPoint: "product",
      fields: ["updated_at"],
      variables: {
        filters: {
          metadata: { synced_from: "dummyjson" }
        },
        order: { updated_at: "DESC" },
        limit: 1
      }
    }
    const lastSyncResult = await remoteQuery(lastSyncQuery)
    const lastProduct = Array.isArray(lastSyncResult) ? lastSyncResult[0] : (lastSyncResult.rows?.[0] || lastSyncResult.data?.[0])

    var last_synced_at = lastProduct ? lastProduct.updated_at : null

  } catch (e: any) {
    console.warn("Failed to query stats via remoteQuery:", e.message)
  }

  res.json({ categories, collections, last_synced_at })
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
