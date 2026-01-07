const { Modules } = require("@medusajs/framework/utils");

module.exports = async function (container) {
    const productModule = container.resolve(Modules.PRODUCT);
    console.log("Product Module Methods (Category):");
    console.log(Object.keys(productModule).filter(k => k.toLowerCase().includes("category")));
}
