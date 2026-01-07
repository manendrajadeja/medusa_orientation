import { z } from "zod"

export const createBrandValidator = z.object({
  name: z.string(),
})