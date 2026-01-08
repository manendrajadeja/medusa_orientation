import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateReviewWorkflow } from "../../../../workflows/update-review"
import { z } from "zod"

const UpdateReviewSchema = z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { id } = req.params
    const container = req.scope

    const parsed = UpdateReviewSchema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ message: "Invalid request", errors: parsed.error })
        return
    }

    try {
        const { result } = await updateReviewWorkflow(container).run({
            input: {
                id,
                data: parsed.data
            }
        })
        res.json({ review: result })
    } catch (e: any) {
        console.error("Failed to update review", e)
        res.status(500).json({ message: "Failed to update review", error: e.message })
    }
}
