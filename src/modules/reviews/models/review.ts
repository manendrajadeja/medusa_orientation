import { model } from "@medusajs/framework/utils"

export const Review = model.define("review", {
    id: model.id().primaryKey(),
    rating: model.number().default(0),
    comment: model.text().nullable(),
    status: model.enum(["pending", "approved", "rejected"]).default("pending"),
    product_id: model.text().searchable(),
})
