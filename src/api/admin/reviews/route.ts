import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../modules/reviews"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const reviewModuleService = req.scope.resolve(REVIEW_MODULE)

    const filters: any = {}
    if (req.query.status) {
        filters.status = req.query.status
    }
    if (req.query.product_id) {
        filters.product_id = req.query.product_id
    }

    const [reviews, count] = await reviewModuleService.listAndCountReviews(
        filters,
        {
            take: Number(req.query.limit) || 50,
            skip: Number(req.query.offset) || 0,
            order: { created_at: "DESC" }
        }
    )

    res.json({ reviews, count })
}

export const AUTHENTICATE = false
