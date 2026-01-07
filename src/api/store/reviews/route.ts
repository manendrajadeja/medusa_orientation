import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../modules/reviews"
import { PostReviewSchema } from "./validators"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const { rating, comment, product_id } = PostReviewSchema.parse(req.body)

    const remoteQuery = req.scope.resolve("remoteQuery")
    const query = {
        entryPoint: "product",
        fields: ["id"],
        variables: {
            filters: { id: product_id }
        }
    }

    const { data } = await remoteQuery(query)
    if (!data || data.length === 0) {
        return res.status(404).json({ message: "Product not found" })
    }

    const reviewModuleService = req.scope.resolve(REVIEW_MODULE)
    const review = await reviewModuleService.createReviews({
        rating,
        comment,
        product_id,
        status: "pending"
    })

    res.json({ review })
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const reviewModuleService = req.scope.resolve(REVIEW_MODULE)

    const filters: any = { status: "approved" }
    if (req.query.product_id) {
        filters.product_id = req.query.product_id
    }

    const [reviews, count] = await reviewModuleService.listAndCountReviews(
        filters,
        {
            take: Number(req.query.limit) || 20,
            skip: Number(req.query.offset) || 0,
            order: { created_at: "DESC" }
        }
    )

    res.json({ reviews, count })
}

export const AUTHENTICATE = false
