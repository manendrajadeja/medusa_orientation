"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProductsWorkflow = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const core_flows_1 = require("@medusajs/medusa/core-flows");
exports.importProductsWorkflow = (0, workflows_sdk_1.createWorkflow)("import-products-workflow", (input) => {
    // In a real scenario, we might want to validate or transform here.
    // For now, we assume the input 'products' are already in the Medusa 'BatchProductInput' format
    // or close enough that we can just partition them into create/update.
    // However, the batchProductsWorkflow takes { create: [], update: [], delete: [] }
    // We need a step to split them. But wait, `batchProductsWorkflow` expects { create: [], update: [] }.
    // The existing sync job does this logic manually.
    // Let's rely on the caller to split them or we can add a step here.
    // For simplicity and modularity, let's keep the logic close to the core.
    // Actually, the simplest way to make this reusable for the CSV import
    // is to have this workflow accept { create: [], update: [] }.
    const result = core_flows_1.batchProductsWorkflow.runAsStep({
        input: {
            create: input.products.filter((p) => !p.id),
            update: input.products.filter((p) => !!p.id),
        }
    });
    return new workflows_sdk_1.WorkflowResponse(result);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LXByb2R1Y3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9pbXBvcnQtcHJvZHVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUVBQW9GO0FBQ3BGLDREQUFtRTtBQVF0RCxRQUFBLHNCQUFzQixHQUFHLElBQUEsOEJBQWMsRUFDaEQsMEJBQTBCLEVBQzFCLENBQUMsS0FBa0MsRUFBRSxFQUFFO0lBRW5DLG1FQUFtRTtJQUNuRSwrRkFBK0Y7SUFDL0Ysc0VBQXNFO0lBQ3RFLGtGQUFrRjtJQUVsRixzR0FBc0c7SUFDdEcsa0RBQWtEO0lBQ2xELG9FQUFvRTtJQUNwRSx5RUFBeUU7SUFFekUsc0VBQXNFO0lBQ3RFLDhEQUE4RDtJQUU5RCxNQUFNLE1BQU0sR0FBRyxrQ0FBcUIsQ0FBQyxTQUFTLENBQUM7UUFDM0MsS0FBSyxFQUFFO1lBQ0gsTUFBTSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDaEQsTUFBTSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUNwRDtLQUNKLENBQUMsQ0FBQTtJQUVGLE9BQU8sSUFBSSxnQ0FBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN2QyxDQUFDLENBQ0osQ0FBQSJ9