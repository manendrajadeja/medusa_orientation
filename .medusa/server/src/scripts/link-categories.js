"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = linkCategories;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function ensureContainer(maybeContainer) {
    let container = maybeContainer;
    if (!container || typeof container.resolve !== "function") {
        if (maybeContainer && maybeContainer.container && typeof maybeContainer.container.resolve === "function") {
            container = maybeContainer.container;
        }
        else {
            const mod = await import("@medusajs/medusa");
            let createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod;
            if (typeof createContainerFn === "function") {
                container = await createContainerFn();
            }
            else if (mod && mod.app && typeof mod.app.createContainer === "function") {
                container = await mod.app.createContainer();
            }
            else {
                throw new Error("Could not obtain a Medusa container with DB access");
            }
        }
    }
    return container;
}
async function fetchAllDummyProducts() {
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
            ids.push(p);
        if (!products.length)
            break;
        skip += limit;
    }
    return ids;
}
async function findOrCreateCategory(container, name) {
    const repo = container.resolve("categoryRepository");
    if (repo && typeof repo.createQueryBuilder === "function") {
        const qb = repo.createQueryBuilder("c");
        qb.where("LOWER(c.name) = :name", { name: name.toLowerCase() });
        const found = await qb.getOne();
        if (found)
            return found;
    }
    try {
        const svc = container.resolve("categoryService");
        if (svc && typeof svc.create === "function") {
            const created = await svc.create({ name, handle: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
            return created;
        }
    }
    catch (e) {
        // fallback
    }
    // repository fallback
    const row = repo.create({ name, handle: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
    return await repo.save(row);
}
async function findProductByExternalId(container, externalId) {
    const repo = container.resolve("productRepository");
    const qb = repo.createQueryBuilder("p");
    qb.where("p.metadata ->> 'external_id' = :id", { id: externalId });
    qb.leftJoinAndSelect("p.categories", "c");
    const prod = await qb.getOne();
    if (prod)
        return prod;
    // fallback to productService
    try {
        const svc = container.resolve("productService");
        if (svc && typeof svc.retrieveByExternalId === "function") {
            // some services may implement convenience method
            return await svc.retrieveByExternalId(externalId);
        }
        if (svc && typeof svc.list === "function") {
            // naive fallback
            const res = await svc.list({ take: 1000 });
            return res.find((r) => String(r.metadata?.external_id) === externalId);
        }
    }
    catch (e) {
        // ignore
    }
    return null;
}
async function linkCategories(containerArg) {
    const container = await ensureContainer(containerArg);
    const dryRun = process.env.SYNC_CATEGORIES_DRY_RUN === "true";
    const products = await fetchAllDummyProducts();
    const uniqueCategories = new Set();
    for (const p of products)
        if (p.category)
            uniqueCategories.add(String(p.category).trim());
    console.log(`Found ${products.length} remote products and ${uniqueCategories.size} unique categories.`);
    // ensure all categories exist
    const nameToCategory = {};
    for (const name of Array.from(uniqueCategories)) {
        try {
            const cat = await findOrCreateCategory(container, name);
            nameToCategory[name.toLowerCase()] = cat;
            console.log(`Category: ${name} -> id=${cat.id}`);
        }
        catch (e) {
            console.error(`Failed to ensure category '${name}': ${e?.message || e}`);
        }
    }
    const report = [];
    for (const p of products) {
        const ext = String(p.id);
        const catName = String(p.category || "").trim();
        if (!catName)
            continue;
        const cat = nameToCategory[catName.toLowerCase()];
        if (!cat) {
            report.push({ external_id: ext, status: "category_missing", category: catName });
            continue;
        }
        const prod = await findProductByExternalId(container, ext);
        if (!prod) {
            report.push({ external_id: ext, status: "product_missing", category: catName });
            continue;
        }
        const currentCats = (prod.categories ?? []).map((c) => String(c.id));
        if (currentCats.includes(String(cat.id))) {
            report.push({ external_id: ext, product_id: prod.id, status: "already_linked", category: catName });
            continue;
        }
        if (dryRun) {
            report.push({ external_id: ext, product_id: prod.id, status: "dry_run_would_link", category: catName, category_id: cat.id });
            continue;
        }
        // attempt to link via productService.update or repository
        try {
            const prodSvc = container.resolve("productService");
            if (prodSvc && typeof prodSvc.update === "function") {
                const newCats = (prod.categories ?? []).map((c) => ({ id: c.id }));
                newCats.push({ id: cat.id });
                await prodSvc.update(prod.id, { categories: newCats });
            }
            else {
                // repository fallback: set relations directly (simple approach)
                const repo = container.resolve("productRepository");
                prod.categories = [...(prod.categories ?? []), { id: cat.id }];
                await repo.save(prod);
            }
            report.push({ external_id: ext, product_id: prod.id, status: "linked", category: catName, category_id: cat.id });
            console.log(`Linked product ${prod.id} (external=${ext}) -> category ${catName} (id=${cat.id})`);
        }
        catch (e) {
            console.error(`Failed linking product external=${ext} to category '${catName}': ${e?.message || e}`);
            report.push({ external_id: ext, product_id: prod.id, status: "link_failed", category: catName, error: e?.message || String(e) });
        }
    }
    const out = path_1.default.resolve(process.cwd(), "tmp/category-link-report.json");
    await fs_1.default.promises.mkdir(path_1.default.dirname(out), { recursive: true });
    await fs_1.default.promises.writeFile(out, JSON.stringify(report, null, 2));
    console.log(`Wrote report to ${out}. Summary: total=${report.length} entries.`);
}
if (require.main === module) {
    ;
    (async () => {
        try {
            const { createContainer } = await import("@medusajs/medusa");
            const container = await createContainer();
            await linkCategories(container);
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
        process.exit(0);
    })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluay1jYXRlZ29yaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvbGluay1jYXRlZ29yaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBMkZBLGlDQTRFQztBQXZLRCw0Q0FBbUI7QUFDbkIsZ0RBQXVCO0FBR3ZCLEtBQUssVUFBVSxlQUFlLENBQUMsY0FBb0I7SUFDakQsSUFBSSxTQUFTLEdBQVEsY0FBYyxDQUFBO0lBQ25DLElBQUksQ0FBQyxTQUFTLElBQUksT0FBTyxTQUFTLENBQUMsT0FBTyxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQzFELElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxTQUFTLElBQUksT0FBTyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN6RyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQTtRQUN0QyxDQUFDO2FBQU0sQ0FBQztZQUNOLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFRLENBQUE7WUFDbkQsSUFBSSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsZUFBZSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFBO1lBQ2pILElBQUksT0FBTyxpQkFBaUIsS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDNUMsU0FBUyxHQUFHLE1BQU0saUJBQWlCLEVBQUUsQ0FBQTtZQUN2QyxDQUFDO2lCQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsS0FBSyxVQUFVLEVBQUUsQ0FBQztnQkFDM0UsU0FBUyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQTtZQUM3QyxDQUFDO2lCQUFN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