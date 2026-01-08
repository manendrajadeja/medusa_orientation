import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk"
import { batchProductsWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "zod"

// Input schema for the workflow
export type ImportProductsWorkflowInput = {
    products: any[]
}

export const importProductsWorkflow = createWorkflow(
    "import-products-workflow",
    (input: ImportProductsWorkflowInput) => {

        // Transform input to separate create and update operations based on ID existence
        // This makes the workflow compatible with the expected input for batchProductsWorkflow

        const batchInput = transform({ input }, (data) => {
            const products = data.input.products || []
            return {
                create: products.filter((p: any) => !p.id),
                update: products.filter((p: any) => !!p.id),
            }
        })

        const result = batchProductsWorkflow.runAsStep({
            input: batchInput
        })

        return new WorkflowResponse(result)
    }
)
