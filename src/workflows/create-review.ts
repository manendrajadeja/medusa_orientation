// Import necessary functions from the Workflow SDK
import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
// Import the module definition to resolve the service
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"

// -----------------------------------------------------------------------------
// STEP: createReviewStep
// This step is responsible for actually interacting with the database to create the review.
// -----------------------------------------------------------------------------
const createReviewStep = createStep(
    "create-review-step",
    // 1. EXECUTION FUNCTION
    // This runs when the workflow executes forward.
    async (input: any, { container }) => {
        // Resolve the Product Review Service from the container
        const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

        // Call the service method to create a review using the input data
        const review = await reviewModuleService.createReviews(input)

        // Return a StepResponse. 
        // 1st arg: The result of this step (the created review)
        // 2nd arg: The data needed to rollback this step (the review ID) in case of failure later.
        return new StepResponse(review, review.id)
    },
    // 2. COMPENSATION FUNCTION (Rollback)
    // This runs if a subsequent step in the workflow fails, to undo the changes.
    async (reviewId: string, { container }) => {
        // Resolve the service again
        const reviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)

        // Delete the review we just created to revert the state
        await reviewModuleService.deleteReviews(reviewId)
    }
)

// -----------------------------------------------------------------------------
// WORKFLOW: createReviewWorkflow
// This groups steps together into a transaction.
// -----------------------------------------------------------------------------
export const createReviewWorkflow = createWorkflow(
    "create-review",
    (input: any) => {
        // Execute the create step
        const review = createReviewStep(input)

        // Return the final result of the workflow
        return new WorkflowResponse(review)
    }
)
