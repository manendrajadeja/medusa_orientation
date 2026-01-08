import { z } from "zod"

export const PostReviewSchema = z.object({
    product_id: z.string(),
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    content: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    customer_id: z.string().optional()
})
