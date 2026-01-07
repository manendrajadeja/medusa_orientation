import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../../modules/reviews"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const reviewModuleService = req.scope.resolve(REVIEW_MODULE)
    const { id } = req.params

    const review = await reviewModuleService.updateReviews({
        id,
        status: "approved"
    })

    res.json({ review })
}

export const AUTHENTICATE = false
