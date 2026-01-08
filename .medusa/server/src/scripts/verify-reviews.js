"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const STORE_URL = "http://localhost:9000/store";
const ADMIN_URL = "http://localhost:9000/admin";
async function main() {
    const fetch = global.fetch || (await import("node-fetch")).default;
    console.log("1. Finding a product...");
    // Using public store API to find a product
    const prodRes = await fetch(`${STORE_URL}/products?limit=1`, {
        headers: { "x-publishable-key": "test" } // Assuming publishable key isn't strictly enforced yet or headers are ignored in dev usually, but let's try basic fetch.
        // If auth required, we might need a key. For now, try simple fetch.
        // Actually, local dev usually needs publishable key for store routes? 
        // Let's assume user has `npm run dev` running.
    });
    // Actually, we can just use the internal sync logs or assume an ID if the server is running with auth.
    // But wait, the user's server is running. I am an agent. I can't easily fetch from localhost:9000 if I am inside the container unless network is open.
    // BUT `run_command` executes on the user's machine. So `curl` works.
}
// Rewriting this as a Medusa Script to run via `npx medusa exec` which is safer/easier for internal access.
async function default_1(maybeContainer) {
    let container = maybeContainer;
    if (maybeContainer.container)
        container = maybeContainer.container;
    const reviewService = container.resolve("reviews");
    const remoteQuery = container.resolve("remoteQuery");
    // 1. Get a product
    const query = { entryPoint: "product", fields: ["id", "title"], variables: { limit: 1 } };
    const res = await remoteQuery(query);
    const products = Array.isArray(res) ? res : (res.rows || res.data || []);
    const product = products[0];
    if (!product) {
        console.log("No products found.");
        return;
    }
    console.log(`Testing with Product: ${product.title} (${product.id})`);
    // 2. Create Review (Service level simulation or internal call)
    console.log("Creating pending review...");
    const review = await reviewService.createReviews({
        rating: 5,
        comment: "Great product!",
        product_id: product.id,
        status: "pending"
    });
    console.log("Review created:", review.id, review.status);
    // 3. List Admin (Pending)
    const [pendingList] = await reviewService.listAndCountReviews({ status: 'pending' });
    const foundPending = pendingList.find(r => r.id === review.id);
    if (foundPending)
        console.log("Verified: Review is pending.");
    else
        console.error("Error: Review not found in pending list.");
    // 4. Approve
    console.log("Approving review...");
    await reviewService.updateReviews({ id: review.id, status: 'approved' });
    // 5. List Store (Approved)
    const [approvedList] = await reviewService.listAndCountReviews({ status: 'approved', product_id: product.id });
    const foundApproved = approvedList.find(r => r.id === review.id);
    if (foundApproved)
        console.log("Verified: Review is approved and linked to product.");
    else
        console.error("Error: Review not found in approved list.");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LXJldmlld3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy92ZXJpZnktcmV2aWV3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXVCQSw0QkEwQ0M7QUEvREQsTUFBTSxTQUFTLEdBQUcsNkJBQTZCLENBQUE7QUFDL0MsTUFBTSxTQUFTLEdBQUcsNkJBQTZCLENBQUE7QUFFL0MsS0FBSyxVQUFVLElBQUk7SUFDZixNQUFNLEtBQUssR0FBSSxNQUFjLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUE7SUFFM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0lBQ3RDLDJDQUEyQztJQUMzQyxNQUFNLE9BQU8sR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLFNBQVMsbUJBQW1CLEVBQUU7UUFDekQsT0FBTyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLENBQUMseUhBQXlIO1FBQ2xLLG9FQUFvRTtRQUNwRSx1RUFBdUU7UUFDdkUsK0NBQStDO0tBQ2xELENBQUMsQ0FBQTtJQUVGLHVHQUF1RztJQUN2Ryx1SkFBdUo7SUFDdkoscUVBQXFFO0FBQ3pFLENBQUM7QUFFRCw0R0FBNEc7QUFDN0YsS0FBSyxvQkFBVyxjQUFjO0lBQ3pDLElBQUksU0FBUyxHQUFHLGNBQWMsQ0FBQTtJQUM5QixJQUFJLGNBQWMsQ0FBQyxTQUFTO1FBQUUsU0FBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUE7SUFFbEUsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNsRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRXBELG1CQUFtQjtJQUNuQixNQUFNLEtBQUssR0FBRyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFB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