import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"

type UpdateReviewStepInput = {
    id: string
    data: {
        status?: "pending" | "approved" | "rejected"
        // add other fields if editable later
    }
}

// -----------------------------------------------------------------------------
// WORKFLOW STEP: updateReviewStep
// Updates a review record in the database.
// -----------------------------------------------------------------------------
const updateReviewStep = createStep(
    "update-review-step",
    // EXECUTION: Perform the update
    async ({ id, data }: UpdateReviewStepInput, { container }) => {
        // Resolve the service from the Medusa container
        const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

        // 1. Fetch the CURRENT state of the review before we change it.
        // We need this 'prevReview' object to enable the rollback mechanism.
        const prevReview = await reviewModuleService.retrieveReview(id)

        // 2. Perform the update operation with the new data
        const review = await reviewModuleService.updateReviews({
            id,
            ...data
        })

        // 3. Return the new review as result, passing 'prevReview' as compensation data
        return new StepResponse(review, prevReview)
    },
    // COMPENSATION: Restore original state on failure
    async (prevReview: any, { container }) => {
        const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
        // Revert the update by saving the old data back to the database
        await reviewModuleService.updateReviews(prevReview)
    }
)

// -----------------------------------------------------------------------------
// MAIN WORKFLOW: updateReviewWorkflow
// Orchestrates the review update process.
// -----------------------------------------------------------------------------
export const updateReviewWorkflow = createWorkflow(
    "update-review",
    (input: UpdateReviewStepInput) => {
        // Run the update step
        const review = updateReviewStep(input)
        // Return result
        return new WorkflowResponse(review)
    }
)
