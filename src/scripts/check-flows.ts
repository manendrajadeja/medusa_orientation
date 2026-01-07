import { Modules } from "@medusajs/framework/utils"

export default async function (container) {
    const productModule = container.resolve(Modules.PRODUCT);
    console.log("Product Module Methods (Category):");
    console.log(Object.keys(productModule).filter(k => k.toLowerCase().includes("category")));

    // Also check for createProductCategory
    if (productModule.createProductCategories) console.log("Has createProductCategories");
    if (productModule.createCategory) console.log("Has createCategory");
}
