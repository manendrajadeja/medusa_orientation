"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.mapProductToMedusaSchema = mapProductToMedusaSchema;
exports.queryExistingProducts = queryExistingProducts;
const utils_1 = require("@medusajs/framework/utils");
function slugify(input) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"); // collapse dashes
}
function mapProductToMedusaSchema(product) {
    const handle = slugify(product.title);
    // If product has no explicit options, we create a default option so the product
    // passes Medusa's validation step (validateProductInputStep requires product options).
    const defaultOption = { title: "Default", values: ["Default"] };
    // Use images, fallback to thumbnail if empty
    let images = [];
    if (product.images && product.images.length > 0) {
        images = product.images.map((src) => ({ url: src }));
    }
    else if (product.thumbnail) {
        images = [{ url: product.thumbnail }];
    }
    // Calculate review stats if available (dummyjson products have 'rating' and 'reviews' array usually)
    const reviewCount = product.reviews ? product.reviews.length : 0;
    const reviewAverage = product.rating || 0;
    const mapped = {
        title: product.title,
        description: product.description,
        handle,
        status: "published",
        metadata: {
            external_id: String(product.id),
            external_category: product.category,
            external_rating: String(reviewAverage),
            reviews_count: reviewCount
        },
        options: [defaultOption],
        variants: [
            {
                title: "Default",
                // Map variant option values to match `options` above
                options: { [defaultOption.title]: defaultOption.values[0] },
                prices: [
                    {
                        amount: Math.round(product.price * 100),
                        currency_code: "usd",
                    },
                ],
            },
        ],
        images,
    };
    return mapped;
}
// Enhanced query to find products by External ID OR Handle
async function queryExistingProducts(container, externalIds, handles) {
    const products = [];
    // Attempt 1: Repository Query (fastest)
    try {
        const productRepository = container.resolve("productRepository");
        if (productRepository && typeof productRepository.createQueryBuilder === "function") {
            const qb = productRepository.createQueryBuilder("p");
            qb.where("p.metadata ->> 'external_id' IN (:...ids)", { ids: externalIds });
            qb.orWhere("p.handle IN (:...handles)", { handles });
            return await qb.getMany();
        }
    }
    catch (err) {
        // Repository access failed
    }
    // Attempt 2: Remote Query (Medusa v2 standard)
    try {
        const remoteQuery = container.resolve("remoteQuery");
        if (remoteQuery) {
            // Query by handle
            const query = {
                entryPoint: "product",
                fields: ["id", "handle", "metadata"],
                variables: {
                    filters: { handle: handles }
                }
            };
            const result = await remoteQuery(query);
            const byHandle = Array.isArray(result) ? result : (result.rows || result.data || []);
            if (Array.isArray(byHandle)) {
                products.push(...byHandle);
            }
        }
    }
    catch (err) {
        console.warn("Could not query existing products via remoteQuery:", err);
    }
    // Attempt 3: Legacy Service (fallback)
    if (products.length === 0) {
        try {
            const key = utils_1.Modules.PRODUCT;
            const productService = container.resolve(key);
            // Check for listProducts (v2 module) or list (v1 service)
            const listFn = productService.listProducts || productService.list;
            if (typeof listFn === "function") {
                const byHandles = await listFn.bind(productService)({ handle: handles }, { take: handles.length });
                products.push(...byHandles);
            }
        }
        catch (err) {
            // ignore
        }
    }
    return products;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy1oZWxwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3N5bmMtaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTJCQSwwQkFPQztBQUVELDREQWdEQztBQUdELHNEQXdEQztBQTlJRCxxREFBbUQ7QUEwQm5ELFNBQWdCLE9BQU8sQ0FBQyxLQUFhO0lBQ2pDLE9BQU8sS0FBSztTQUNQLFdBQVcsRUFBRTtTQUNiLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO1NBQzVCLElBQUksRUFBRTtTQUNOLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUEsQ0FBQyxrQkFBa0I7QUFDL0MsQ0FBQztBQUVELFNBQWdCLHdCQUF3QixDQUFDLE9BQXFCO0lBQzFELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFckMsZ0ZBQWdGO0lBQ2hGLHVGQUF1RjtJQUN2RixNQUFNLGFBQWEsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQTtJQUUvRCw2Q0FBNkM7SUFDN0MsSUFBSSxNQUFNLEdBQXNCLEVBQUUsQ0FBQTtJQUNsQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDOUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN4RCxDQUFDO1NBQU0sSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0IsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDekMsQ0FBQztJQUVELHFHQUFxRztJQUNyRyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFBO0lBRXpDLE1BQU0sTUFBTSxHQUFRO1FBQ2hCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztRQUNwQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7UUFDaEMsTUFBTTtRQUNOLE1BQU0sRUFBRSxXQUFXO1FBQ25CLFFBQVEsRUFBRTtZQUNOLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUMvQixpQkFBaUIsRUFBRSxPQUFPLENBQUMsUUFBUTtZQUNuQyxlQUFlLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUN0QyxhQUFhLEVBQUUsV0FBVztTQUM3QjtRQUNELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztRQUN4QixRQUFRLEVBQUU7WUFDTjtnQkFDSSxLQUFLLEVBQUUsU0FBUztnQkFDaEIscURBQXFEO2dCQUNyRCxPQUFPLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUMzRCxNQUFNLEVBQUU7b0JBQ0o7d0JBQ0ksTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7d0JBQ3ZDLGFBQWEsRUFBRSxLQUFLO3FCQUN2QjtpQkFDSjthQUNKO1NBQ0o7UUFDRCxNQUFNO0tBQ1QsQ0FBQTtJQUVELE9BQU8sTUFBTSxDQUFBO0FBQ2pCLENBQUM7QUFFRCwyREFBMkQ7QUFDcEQsS0FBSyxVQUFVLHFCQUFxQixDQUFDLFNBQTBCLEVBQUUsV0FBcUIsRUFBRSxPQUFpQjtJQUM1RyxNQUFNLFFBQVEsR0FBVSxFQUFFLENBQUE7SUFFMUIsd0NBQXdDO0lBQ3hDLElBQUksQ0FBQztRQUNELE1BQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBUSxDQUFBO1FBQ3ZFLElBQUksaUJBQWlCLElBQUksT0FBTyxpQkFBaUIsQ0FBQyxrQkFBa0IsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUNsRixNQUFNLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNwRCxFQUFFLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxFQUFFLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7WUFDM0UsRUFBRSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7WUFDcEQsT0FBTyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUM3QixDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCwyQkFBMkI7SUFDL0IsQ0FBQztJQUVELCtDQUErQztJQUMvQyxJQUFJLENBQUM7UUFDRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ3BELElBQUksV0FBVyxFQUFFLENBQUM7WUFDZCxrQkFBa0I7WUFDbEIsTUFBTSxLQUFLLEdBQUc7Z0JBQ1YsVUFBVSxFQUFFLFNBQVM7Z0JBQ3JCLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDO2dCQUNwQyxTQUFTLEVBQUU7b0JBQ1AsT0FBTyxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtpQkFDL0I7YUFDSixDQUFBO1lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQTtZQUVwRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFBO1lBQzlCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzNFLENBQUM7SUFFRCx1Q0FBdUM7SUFDdkMsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQztZQUNELE1BQU0sR0FBRyxHQUFHLGVBQU8sQ0FBQyxPQUFPLENBQUE7WUFDM0IsTUFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQVEsQ0FBQTtZQUNwRCwwREFBMEQ7WUFDMUQsTUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLFlBQVksSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFBO1lBQ2pFLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sU0FBUyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtnQkFDbEcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFBO1lBQy9CLENBQUM7UUFDTCxDQUFDO1FBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNYLFNBQVM7UUFDYixDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUMifQ==