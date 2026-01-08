"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.POST = exports.GET = void 0;
const sync_products_1 = __importDefault(require("../../../jobs/sync-products"));
// GET /admin/sync/dummyjson
const GET = async (req, res) => {
    const container = req.scope;
    // Use repository queries to find categories and collections with metadata.synced_from = 'dummyjson'
    let categories = [];
    let collections = [];
    try {
        const catRepo = container.resolve("categoryRepository");
        const qbCat = catRepo.createQueryBuilder("c");
        qbCat.where("c.metadata ->> 'synced_from' = :src", { src: "dummyjson" });
        const categoryRows = await qbCat.getMany();
        categories = categoryRows.map((c) => ({ id: c.id, name: c.name, handle: c.handle, metadata: c.metadata }));
    }
    catch (e) {
        console.warn("categoryRepository not available in current runtime; cannot list categories via API.", e?.message || e);
    }
    try {
        const collRepo = container.resolve("productCollectionRepository");
        const qbColl = collRepo.createQueryBuilder("p");
        qbColl.where("p.metadata ->> 'synced_from' = :src", { src: "dummyjson" });
        const collectionRows = await qbColl.getMany();
        collections = collectionRows.map((c) => ({ id: c.id, title: c.title, handle: c.handle, metadata: c.metadata }));
    }
    catch (e) {
        console.warn("productCollectionRepository not available in current runtime; cannot list collections via API.", e?.message || e);
    }
    res.json({ categories, collections });
};
exports.GET = GET;
// POST /admin/sync/dummyjson -> trigger a sync run (async)
const POST = async (req, res) => {
    const container = req.scope;
    (async () => {
        try {
            await (0, sync_products_1.default)(container);
        }
        catch (e) {
            console.error("Background sync failed:", e);
        }
    })();
    res.status(202).json({ status: "accepted" });
};
exports.POST = POST;
exports.AUTHENTICATE = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3N5bmMvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsZ0ZBQXlEO0FBRXpELDRCQUE0QjtBQUNyQixNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDbkUsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTtJQUUzQixvR0FBb0c7SUFDcEcsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ25CLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQTtJQUNwQixJQUFJLENBQUM7UUFDSCxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFRLENBQUE7UUFDOUQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzdDLEtBQUssQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUN4RSxNQUFNLFlBQVksR0FBRyxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUMxQyxVQUFVLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2pILENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxzRkFBc0YsRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ3ZILENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFRLENBQUE7UUFDeEUsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQy9DLE1BQU0sQ0FBQyxLQUFLLENBQUMscUNBQXFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQTtRQUN6RSxNQUFNLGNBQWMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUM3QyxXQUFXLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3RILENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxnR0FBZ0csRUFBRSxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ2pJLENBQUM7SUFFRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7QUFDdkMsQ0FBQyxDQUFBO0FBM0JZLFFBQUEsR0FBRyxPQTJCZjtBQUVELDJEQUEyRDtBQUNwRCxNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDcEUsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FFeEI7SUFBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ1osSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFBLHVCQUFlLEVBQUMsU0FBUyxDQUFDLENBQUE7UUFDbEMsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzdDLENBQUM7SUFDSCxDQUFDLENBQUMsRUFBRSxDQUFBO0lBRU4sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtBQUM5QyxDQUFDLENBQUE7QUFaWSxRQUFBLElBQUksUUFZaEI7QUFFWSxRQUFBLFlBQVksR0FBRyxLQUFLLENBQUEifQ==