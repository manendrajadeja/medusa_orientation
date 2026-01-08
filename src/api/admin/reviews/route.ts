import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const container = req.scope
    const remoteQuery = container.resolve("remoteQuery")

    try {
        const { product_id } = req.query

        const variables: any = { limit: 100, skip: 0 }
        if (product_id) {
            variables.filters = { product_id }
        }

        const query = {
            entryPoint: "review",
            fields: ["*", "product.*"],
            variables
        }

        const result = await remoteQuery(query)
        const reviews = Array.isArray(result) ? result : (result.rows || result.data || [])

        res.json({ reviews })
    } catch (e: any) {
        res.status(500).json({ message: "Failed to fetch reviews", error: e.message })
    }
}
