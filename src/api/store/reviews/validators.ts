import { z } from "zod"

export const PostReviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    product_id: z.string(),
})
