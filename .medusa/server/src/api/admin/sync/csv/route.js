"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const import_products_1 = require("../../../../../workflows/import-products");
const sync_helpers_1 = require("../../../../../utils/sync-helpers");
const POST = async (req, res) => {
    const container = req.scope;
    // Expecting an array of "raw" product objects from the CSV
    // We assume the CSV columns match the DummyProduct keys roughly
    const { products: rawProducts } = req.body;
    if (!rawProducts || !Array.isArray(rawProducts) || rawProducts.length === 0) {
        res.status(400).json({ message: "No products provided" });
        return;
    }
    console.log(`Received manual import request for ${rawProducts.length} products`);
    // Normalize input to DummyProduct structure so we can reuse the mapper
    const normalizedProducts = rawProducts.map(p => ({
        id: p.external_id || p.id || Math.floor(Math.random() * 1000000), // Fallback ID if missing
        title: p.title || "Untitled",
        description: p.description || "",
        price: Number(p.price) || 0,
        category: p.category,
        thumbnail: p.thumbnail,
        images: p.images ? String(p.images).split(",").map(i => i.trim()) : [],
        // ... extend as needed
        rating: Number(p.rating) || 0,
        brand: p.brand
    }));
    // Reuse the resolution logic (Create vs Update)
    // 1. Get External IDs and Handles
    const externalIds = normalizedProducts.map(p => String(p.id));
    const handlesToCheck = normalizedProducts.map(p => (0, sync_helpers_1.slugify)(p.title));
    // 2. Query Existing
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
    const toSync = [];
    for (const item of normalizedProducts) {
        const mapped = (0, sync_helpers_1.mapProductToMedusaSchema)(item);
        const extId = String(item.id);
        const handle = mapped.handle;
        let match = byExternal[extId];
        if (!match && byHandle[handle]) {
            match = byHandle[handle];
        }
        if (match) {
            toSync.push({ id: match.id, ...mapped });
        }
        else {
            toSync.push(mapped);
        }
    }
    // 3. Run Workflow
    try {
        const { result } = await (0, import_products_1.importProductsWorkflow)(container).run({
            input: { products: toSync }
        });
        res.json({
            status: "success",
            count: toSync.length,
            details: result
        });
    }
    catch (e) {
        console.error("Manual import failed:", e);
        res.status(500).json({ message: e.message });
    }
};
exports.POST = POST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3N5bmMvY3N2L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDhFQUFpRjtBQUNqRixvRUFLMEM7QUFFbkMsTUFBTSxJQUFJLEdBQUcsS0FBSyxFQUFFLEdBQWtCLEVBQUUsR0FBbUIsRUFBRSxFQUFFO0lBQ2xFLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUE7SUFDM0IsMkRBQTJEO0lBQzNELGdFQUFnRTtJQUNoRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUEyQyxDQUFBO0lBRWpGLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDMUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFBO1FBQ3pELE9BQU07SUFDVixDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsV0FBVyxDQUFDLE1BQU0sV0FBVyxDQUFDLENBQUE7SUFFaEYsdUVBQXVFO0lBQ3ZFLE1BQU0sa0JBQWtCLEdBQW1CLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdELEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUseUJBQXlCO1FBQzNGLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLFVBQVU7UUFDNUIsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFX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