"use strict";
// src/jobs/sync-products.ts
// Production-ready product sync job
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithRetry = fetchWithRetry;
exports.fetchTotalCount = fetchTotalCount;
exports.fetchAllProducts = fetchAllProducts;
exports.batched = batched;
exports.default = syncProductsJob;
const core_flows_1 = require("@medusajs/medusa/core-flows");
const import_products_1 = require("../workflows/import-products");
const sync_helpers_1 = require("../utils/sync-helpers");
const DUMMY_API_BASE = "https://dummyjson.com/products";
const PAGE_LIMIT = 30;
const DEFAULT_BATCH_SIZE = Number(process.env.SYNC_PRODUCTS_BATCH_SIZE) || 15;
const DEFAULT_MAX_RETRIES = Number(process.env.SYNC_PRODUCTS_MAX_RETRIES) || 2;
const DRY_RUN = process.env.SYNC_PRODUCTS_DRY_RUN === "true";
const PAGE_DELAY_MS = Number(process.env.SYNC_PRODUCTS_PAGE_DELAY_MS) || 0;
function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}
async function fetchWithRetry(url, opts = {}, maxRetries = DEFAULT_MAX_RETRIES) {
    let attempt = 0;
    const baseDelay = 500;
    // Use global fetch (Node 18+) or fall back to node-fetch if available
    const _fetch = global.fetch || (await import("node-fetch")).default;
    while (true) {
        try {
            const res = await _fetch(url, opts);
            if (res.ok)
                return res;
            // Retry on 429/502/503/504
            if ([429, 502, 503, 504].includes(res.status)) {
                throw new Error(`Transient HTTP error ${res.status}`);
            }
            // Non-retryable HTTP error
            const text = await res.text().catch(() => "");
            const err = new Error(`Fetch failed ${res.status}: ${text}`);
            err.status = res.status;
            throw err;
        }
        catch (err) {
            attempt += 1;
            const isTransient = attempt <= maxRetries;
            if (!isTransient)
                throw err;
            const jitter = Math.floor(Math.random() * 500);
            const wait = baseDelay * Math.pow(2, attempt - 1) + jitter;
            console.warn(`fetchWithRetry: attempt ${attempt} failed, retrying in ${wait}ms: ${err?.message}`);
            await sleep(wait);
        }
    }
}
async function fetchTotalCount() {
    const url = `${DUMMY_API_BASE}?limit=1&skip=0`;
    const res = await fetchWithRetry(url);
    const json = await res.json();
    return Number(json.total ?? 0);
}
async function* fetchAllProducts() {
    let skip = 0;
    let total = Infinity;
    while (skip < total) {
        const url = `${DUMMY_API_BASE}?limit=${PAGE_LIMIT}&skip=${skip}`;
        const res = await fetchWithRetry(url);
        const json = await res.json();
        const products = json.products ?? [];
        total = json.total ?? products.length;
        if (!products.length)
            break;
        for (const p of products) {
            yield p;
        }
        const pageLimit = json.limit ?? products.length ?? PAGE_LIMIT;
        skip += pageLimit;
        // Respect optional page delay to avoid rate-limits
        if (PAGE_DELAY_MS > 0)
            await sleep(PAGE_DELAY_MS);
    }
}
async function* batched(iterable, batchSize = DEFAULT_BATCH_SIZE) {
    let batch = [];
    for await (const item of iterable) {
        batch.push(item);
        if (batch.length >= batchSize) {
            yield batch;
            batch = [];
        }
    }
    if (batch.length)
        yield batch;
}
async function retryWorkflowRun(fn, maxRetries = DEFAULT_MAX_RETRIES) {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        }
        catch (err) {
            attempt += 1;
            if (attempt > maxRetries)
                throw err;
            const wait = 500 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 500);
            console.warn(`Workflow run failed, retrying in ${wait}ms (attempt ${attempt}): ${err?.message}`);
            await sleep(wait);
        }
    }
}
// Category Sync Logic
async function fetchCategories() {
    const url = "https://dummyjson.com/products/categories";
    const res = await fetchWithRetry(url);
    const json = await res.json();
    // json is array of { slug, name, url }
    return json;
}
async function syncCategories(container) {
    console.log("Syncing categories via Workflow...");
    const rawCategories = await fetchCategories();
    const categoriesToCreate = [];
    // Check existing
    let existingHandles = new Set();
    try {
        const remoteQuery = container.resolve("remoteQuery");
        // @ts-ignore
        const query = {
            entryPoint: "product_category",
            fields: ["handle"],
            variables: { limit: 1000 }
        };
        const res = await remoteQuery(query);
        const rows = Array.isArray(res) ? res : (res.rows || res.data || []);
        rows.forEach((r) => existingHandles.add(r.handle));
    }
    catch (e) {
        console.warn("Could not fetch existing categories:", e);
    }
    for (const cat of rawCategories) {
        if (!existingHandles.has(cat.slug)) {
            categoriesToCreate.push({
                name: cat.name,
                handle: cat.slug,
                metadata: { url: cat.url, synced_from: "dummyjson" }
            });
        }
    }
    if (categoriesToCreate.length > 0) {
        console.log(`Creating ${categoriesToCreate.length} new categories...`);
        if (DRY_RUN) {
            console.log("DRY RUN: Skipping category creation.");
        }
        else {
            try {
                // Use createProductCategoriesWorkflow
                const { result } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
                    input: { product_categories: categoriesToCreate }
                });
                console.log(`Created ${result.length} categories.`);
            }
            catch (e) {
                console.error("Failed to create categories:", e?.message || e);
            }
        }
    }
    else {
        console.log("All categories already exist.");
    }
}
async function syncProductsJob(maybeContainer) {
    console.log("Starting product sync...");
    // Normalize container: medusa exec sometimes injects a lightweight object.
    let container = maybeContainer;
    if (!container || typeof container.resolve !== "function") {
        if (maybeContainer && maybeContainer.container && typeof maybeContainer.container.resolve === "function") {
            container = maybeContainer.container;
        }
        else {
            try {
                const mod = await import("@medusajs/medusa");
                const createContainerFn = mod.createContainer || (mod.default && mod.default.createContainer) || mod.default || mod;
                if (typeof createContainerFn === "function") {
                    container = await createContainerFn();
                }
            }
            catch (e) {
                console.warn("Could not create a full Medusa container;", e?.message || e);
            }
        }
    }
    // 1. Sync Categories first
    if (container) {
        await syncCategories(container).catch(err => console.error("Category sync failed non-fatally:", err));
    }
    else {
        console.warn("Skipping category sync: Use 'medusa exec' with a valid container.");
    }
    // Clamp configured batch size into the recommended range (10-20)
    const requestedBatchSize = Number(process.env.SYNC_PRODUCTS_BATCH_SIZE) || DEFAULT_BATCH_SIZE;
    const batchSize = Math.max(10, Math.min(20, requestedBatchSize));
    const createCount = { created: 0, updated: 0 };
    const syncedProducts = [];
    // Progress tracking
    const totalProducts = await fetchTotalCount().catch((e) => {
        console.warn("Failed to fetch total product count, progress will be relative.", e?.message || e);
        return null;
    });
    try {
        const productsStream = fetchAllProducts();
        let processed = 0;
        for await (const page of batched(productsStream, batchSize)) {
            const externalIds = page.map((p) => String(p.id));
            // Map temporary to get handles to query
            const handlesToCheck = page.map(p => (0, sync_helpers_1.slugify)(p.title));
            processed += page.length;
            const percent = totalProducts ? ((processed / totalProducts) * 100).toFixed(1) : undefined;
            console.log(`Processing batch of ${page.length} products (externalIds: ${externalIds.slice(0, 5).join(',')}${externalIds.length > 5 ? '...' : ''})${percent ? ` — progress: ${percent}%` : ''}`);
            // Query existing by ID or Handle
            const existing = await (0, sync_helpers_1.queryExistingProducts)(container, externalIds, handlesToCheck);
            const byExternal = {};
            const byHandle = {};
            for (const e of existing) {
                if (e.metadata?.external_id) {
                    byExternal[String(e.metadata.external_id)] = e;
                }
                if (e.handle) {
                    byHandle[e.handle] = e;
                }
            }
            const toCreate = [];
            const toUpdate = [];
            for (const item of page) {
                const mapped = (0, sync_helpers_1.mapProductToMedusaSchema)(item);
                const extId = String(item.id);
                const handle = mapped.handle;
                let match = byExternal[extId];
                if (!match && byHandle[handle]) {
                    match = byHandle[handle];
                }
                if (match) {
                    toUpdate.push({ id: match.id, ...mapped });
                }
                else {
                    toCreate.push(mapped);
                }
            }
            console.log(`Batch split → create=${toCreate.length}, update=${toUpdate.length}`);
            if (DRY_RUN) {
                console.log(`DRY RUN enabled — skipping workflow. create: ${toCreate.length}, update: ${toUpdate.length}`);
                createCount.created += toCreate.length;
                createCount.updated += toUpdate.length;
                continue;
            }
            const allBatchProducts = [...toCreate, ...toUpdate];
            if (allBatchProducts.length === 0)
                continue;
            // run workflow with retry
            const run = async () => {
                // Using the new modular workflow
                const { result } = await (0, import_products_1.importProductsWorkflow)(container).run({
                    input: { products: allBatchProducts }
                });
                return result;
            };
            try {
                await retryWorkflowRun(run);
                createCount.created += toCreate.length;
                createCount.updated += toUpdate.length;
                // Collect for CSV
                for (const p of toCreate)
                    syncedProducts.push({ ...p, _status: 'created' });
                for (const p of toUpdate)
                    syncedProducts.push({ ...p, _status: 'updated' });
                console.log(`Batch processed: created=${toCreate.length}, updated=${toUpdate.length}`);
            }
            catch (err) {
                console.error(`Batch failed after retries: ${err?.message}`);
            }
        }
        console.log(`Product sync completed. created=${createCount.created} updated=${createCount.updated}`);
        // Generate and save CSV
        if (syncedProducts.length > 0) {
            try {
                const fs = await import("fs/promises");
                const path = await import("path");
                const exportDir = path.resolve(process.cwd(), "exports");
                await fs.mkdir(exportDir, { recursive: true });
                const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                const filename = `products-sync-${timestamp}.csv`;
                const filePath = path.join(exportDir, filename);
                const csvContent = [
                    "External ID,Handle,Title,Status,Action",
                    ...syncedProducts.map(p => {
                        const extId = p.metadata?.external_id || "";
                        // escape commas in title
                        const title = String(p.title).replace(/"/g, '""');
                        return `${extId},${p.handle},"${title}",${p.status},${p._status}`;
                    })
                ].join("\n");
                await fs.writeFile(filePath, csvContent);
                console.log(`Exported sync details to: ${filePath}`);
            }
            catch (e) {
                console.error("Failed to export CSV:", e);
            }
        }
    }
    catch (err) {
        console.error(`Product sync job failed: ${err?.message}`);
        throw err;
    }
}
// NOTE: Schedule removed to prevent automatic installation.
// export const config = {
//   name: "sync-products",
//   schedule: DEFAULT_SCHEDULE,
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1wcm9kdWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9qb2JzL3N5bmMtcHJvZHVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRCQUE0QjtBQUM1QixvQ0FBb0M7O0FBdUJwQyx3Q0E2QkM7QUFFRCwwQ0FLQztBQUVELDRDQW1CQztBQUVELDBCQVVDO0FBOEVELGtDQWlLQztBQXhVRCw0REFBNkU7QUFDN0Usa0VBQXFFO0FBQ3JFLHdEQUs4QjtBQUU5QixNQUFNLGNBQWMsR0FBRyxnQ0FBZ0MsQ0FBQTtBQUN2RCxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDckIsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUM3RSxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEtBQUssTUFBTSxDQUFBO0FBQzVELE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBRTFFLFNBQVMsS0FBSyxDQUFDLEVBQVU7SUFDdkIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2xELENBQUM7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQVcsRUFBRSxPQUFvQixFQUFFLEVBQUUsVUFBVSxHQUFHLG1CQUFtQjtJQUN4RyxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUE7SUFDZixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUE7SUFDckIsc0VBQXNFO0lBQ3RFLE1B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