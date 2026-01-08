"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrandWorkflow = exports.createBrandStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const brand_1 = require("../modules/brand");
exports.createBrandStep = (0, workflows_sdk_1.createStep)("create-brand-step", async (input, { container }) => {
    const brandModuleService = container.resolve(brand_1.BRAND_MODULE);
    const brand = await brandModuleService.createBrands(input);
    return new workflows_sdk_1.StepResponse(brand, brand.id);
}, async (id, { container }) => {
    const brandModuleService = container.resolve(brand_1.BRAND_MODULE);
    await brandModuleService.deleteBrands(id);
});
exports.createBrandWorkflow = (0, workflows_sdk_1.createWorkflow)("create-brand", (input) => {
    const brand = (0, exports.createBrandStep)(input);
    return new workflows_sdk_1.WorkflowResponse(brand);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWJyYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3dvcmtmbG93cy9jcmVhdGUtYnJhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBSzZDO0FBQzNDLDRDQUFnRDtBQU9uQyxRQUFBLGVBQWUsR0FBRyxJQUFBLDBCQUFVLEVBQ3ZDLG1CQUFtQixFQUNuQixLQUFLLEVBQUUsS0FBMkIsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDbkQsTUFBTSxrQkFBa0IsR0FDdEIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFDLENBQUM7SUFFbEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFM0QsT0FBTyxJQUFJLDRCQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMzQyxDQUFDLEVBQ0QsS0FBSyxFQUFFLEVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUU7SUFDbEMsTUFBTSxrQkFBa0IsR0FDdEIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFDLENBQUM7SUFFbEMsTUFBTSxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsQ0FBQyxDQUNGLENBQUM7QUFNVyxRQUFBLG1CQUFtQixHQUFHLElBQUEsOEJBQWMsRUFDL0MsY0FBYyxFQUNkLENBQUMsS0FBK0IsRUFBRSxFQUFFO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUEsdUJBQWUsRUFBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxPQUFPLElBQUksZ0NBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDckMsQ0FBQyxDQUNGLENBQUMifQ==