"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = missingProducts;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function missingProducts(maybeContainer) {
    // normalize container: medusa exec may not pass a full container, so create one if needed
    let container = maybeContainer;
    try {
        // debug shape of the provided arg
        console.log("missing-products: received arg type=", typeof maybeContainer);
        if (maybeContainer && typeof maybeContainer === "object") {
            console.log("missing-products: arg keys=", Object.keys(maybeContainer));
        }
    }
    catch (e) {
        // ignore
    }
    if (!container || typeof container.resolve !== "function") {
        // medusa exec passes an object with shape { container, args }
        if (maybeContainer && maybeContainer.container && typeof maybeContainer.container.resolve === "function") {
            container = maybeContainer.container;
        }
        else {
            // try to use medusa's runtime to create a container but fallback gracefully
            const mod = await import("@medusajs/medusa");
            let createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod;
            if (typeof createContainerFn === "function") {
                container = await createContainerFn();
            }
            else if (mod && mod.app && typeof mod.app.createContainer === "function") {
                container = await mod.app.createContainer();
            }
            else {
                console.warn("Could not resolve createContainer; proceeding may fail if no DB access is available");
            }
        }
    }
    // Fetch all dummy product IDs
    const fetch = global.fetch || (await import("node-fetch")).default;
    const base = "https://dummyjson.com/products";
    const ids = [];
    let skip = 0;
    const limit = 100;
    while (true) {
        const res = await fetch(`${base}?limit=${limit}&skip=${skip}`);
        const json = await res.json();
        const products = json.products ?? [];
        for (const p of products)
            ids.push(String(p.id));
        if (!products.length)
            break;
        skip += limit;
    }
    // Ensure we have a container with productRepository; if not, try to create a full container
    try {
        container.resolve("productRepository");
    }
    catch (e) {
        console.log("Current container lacks productRepository; available registrations (sample):", Object.keys(container.registrations || {}).slice(0, 20));
        console.log("Attempting to create a full container for DB access...");
        const mod = await import("@medusajs/medusa");
        let createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod;
        if (typeof createContainerFn === "function") {
            container = await createContainerFn();
        }
        else if (mod && mod.app && typeof mod.app.createContainer === "function") {
            container = await mod.app.createContainer();
        }
        else {
            console.log("Could not obtain a full container; trying to use productService if available.");
        }
    }
    // Try productRepository first; fall back to productService
    let existingIds = [];
    try {
        const prodRepo = container.resolve("productRepository");
        const qb = prodRepo.createQueryBuilder("p");
        qb.select("p.metadata ->> 'external_id'", "external_id");
        qb.where("p.metadata ->> 'external_id' IS NOT NULL");
        const rows = await qb.getRawMany();
        existingIds = rows.map((r) => String(r.external_id));
    }
    catch (e) {
        console.warn("productRepository not available; falling back to productService.list() if available", e?.message || e);
        try {
            const prodSvc = container.resolve("productService");
            if (prodSvc && typeof prodSvc.list === "function") {
                const res = await prodSvc.list({ take: 1000 });
                existingIds = res.map((r) => String(r.metadata?.external_id)).filter(Boolean);
            }
        }
        catch (e2) {
            console.error("Could not obtain existing products from repository or service: " + (e2?.message || e2));
            console.error("Note: The medusa exec environment doesn't expose repositories/services. Run this script directly with a full Medusa container: `npx ts-node src/scripts/missing-products.ts` or `node -r ts-node/register src/scripts/missing-products.ts`");
            process.exit(1);
        }
    }
    const existing = new Set(existingIds);
    const missing = ids.filter((id) => !existing.has(id));
    console.log(`Found ${missing.length} missing products.`);
    if (!missing.length) {
        console.log("No missing products — all good.");
        return;
    }
    const outPath = path_1.default.resolve(process.cwd(), "tmp/missing-products.json");
    await fs_1.default.promises.mkdir(path_1.default.dirname(outPath), { recursive: true });
    await fs_1.default.promises.writeFile(outPath, JSON.stringify(missing, null, 2));
    console.log(`Wrote missing product ids to ${outPath}. Sample:`);
    console.log(missing.slice(0, 20));
}
if (require.main === module) {
    ;
    (async () => {
        const { createContainer } = await import("@medusajs/medusa");
        const container = await createContainer();
        await missingProducts(container);
        process.exit(0);
    })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzc2luZy1wcm9kdWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL21pc3NpbmctcHJvZHVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFJQSxrQ0F5R0M7QUE3R0QsNENBQW1CO0FBQ25CLGdEQUF1QjtBQUdSLEtBQUssVUFBVSxlQUFlLENBQUMsY0FBb0I7SUFDaEUsMEZBQTBGO0lBQzFGLElBQUksU0FBUyxHQUFRLGNBQWMsQ0FBQTtJQUNuQyxJQUFJLENBQUM7UUFDSCxrQ0FBa0M7UUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsRUFBRSxPQUFPLGNBQWMsQ0FBQyxDQUFBO1FBQzFFLElBQUksY0FBYyxJQUFJLE9BQU8sY0FBYyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3pELE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO1FBQ3pFLENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLFNBQVM7SUFDWCxDQUFDO0lBRUQsSUFBSSxDQUFDLFNBQVMsSUFBSSxPQUFPLFNBQVMsQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDMUQsOERBQThEO1FBQzlELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxTQUFTLElBQUksT0FBTyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN6RyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQTtRQUN0QyxDQUFDO2FBQU0sQ0FBQztZQUNOLDRFQUE0RTtZQUM1RSxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBUSxDQUFBO1lBQ25ELElBQUksaUJBQWlCLEdBQUcsR0FBRyxDQUFDLGVBQWUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FB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