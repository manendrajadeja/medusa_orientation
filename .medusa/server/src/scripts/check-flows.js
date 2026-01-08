"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const utils_1 = require("@medusajs/framework/utils");
async function default_1(container) {
    const productModule = container.resolve(utils_1.Modules.PRODUCT);
    console.log("Product Module Methods (Category):");
    console.log(Object.keys(productModule).filter(k => k.toLowerCase().includes("category")));
    // Also check for createProductCategory
    if (productModule.createProductCategories)
        console.log("Has createProductCategories");
    if (productModule.createCategory)
        console.log("Has createCategory");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stZmxvd3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9jaGVjay1mbG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDRCQVFDO0FBVkQscURBQW1EO0FBRXBDLEtBQUssb0JBQVcsU0FBUztJQUNwQyxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTFGLHVDQUF1QztJQUN2QyxJQUFJLGFBQWEsQ0FBQyx1QkFBdUI7UUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDdEYsSUFBSSxhQUFhLENBQUMsY0FBYztRQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN4RSxDQUFDIn0=