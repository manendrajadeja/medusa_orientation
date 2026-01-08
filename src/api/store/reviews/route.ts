import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http" // Import Medusa HTTP types for request and response handling
import { createReviewWorkflow } from "../../../workflows/create-review" // Import the workflow to handle review creation logic
import { PostReviewSchema } from "./validators" // Import the Zod schema for validating incoming request body

// POST handler for creating a new review
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    // Get the dependency injection container from the request scope
    const container = req.scope

    // Validate the request body against the defined schema
    const parsed = PostReviewSchema.safeParse(req.body)

    // If validation fails, return a 400 Bad Request error with details
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid request", errors: parsed.error })
        return
    }

    try {
        // Execute the workflow to create the review
        // Passing the container allows the workflow to access services (DB, etc.)
        const { result } = await createReviewWorkflow(container).run({
            input: parsed.data // Pass the validated data as input
        })

        // Return the created review object in the response
        res.json({ review: result })
    } catch (e: any) {
        // Log any errors that occur during the workflow execution
        console.error("Failed to create review", e)
        // Return a 500 Internal Server Error if something goes wrong
        res.status(500).json({ message: "Failed to create review", error: e.message })
    }
}

// GET handler for fetching reviews for a specific product
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    // Get the dependency injection container
    const container = req.scope
    // Resolve the remoteQuery service, used for fetching data across modules
    const remoteQuery = container.resolve("remoteQuery")

    try {
        // Extract product_id from the query parameters (e.g., ?product_id=prod_123)
        const { product_id } = req.query

        // Validate that a product_id was provided
        if (!product_id) {
            res.status(400).json({ message: "product_id is required" })
            return
        }

        // Define the query object for fetching reviews
        const query = {
            entryPoint: "review", // The main entity we are querying
            fields: ["*", "product.*"], // Select all review fields and related product fields
            variables: {
                filters: {
                    product_id, // Filter by the specific product ID
                    status: "approved" // CRITICAL: Only show reviews that have been approved by an admin
                },
                order: { created_at: "DESC" } // Sort by creation date, newest first
            }
        }

        // Execute the query using remoteQuery
        const result = await remoteQuery(query)
        const reviews = Array.isArray(result) ? result : (result.rows || result.data || [])

        // Return the list of reviews
        res.json({ reviews })
    } catch (e: any) {
        // Log error if fetching fails
        console.error("Failed to fetch reviews", e)
        // Return 500 error response
        res.status(500).json({ message: "Failed to fetch reviews", error: e.message })
    }
}
