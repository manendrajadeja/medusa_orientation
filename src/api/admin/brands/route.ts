// src/api/admin/brands/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createBrandWorkflow } from "../../../workflows/create-brand"
import { z } from "zod"
import { createBrandValidator } from "./validators"

type createBrandBody = z.infer<typeof createBrandValidator>

// POST /admin/brands
export const POST = async (
  req: MedusaRequest<createBrandBody>, 
  res: MedusaResponse
) => {
  const { result } = await createBrandWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({ brand: result})
}

// GET /admin/brands
export const GET = async (req: MedusaRequest<createBrandBody>, res: MedusaResponse) => {
  const query = req.scope.resolve("query")
  const { data } = await query.graph({
    entity: "brand",
    fields: ["id", "name"],
  })
  res.json({ brands: data })
}