import { Modules } from "@medusajs/framework/utils"

const STORE_URL = "http://localhost:9000/store"
const ADMIN_URL = "http://localhost:9000/admin"

async function main() {
    const fetch = (global as any).fetch || (await import("node-fetch")).default

    console.log("1. Finding a product...")
    // Using public store API to find a product
    const prodRes = await fetch(`${STORE_URL}/products?limit=1`, {
        headers: { "x-publishable-key": "test" } // Assuming publishable key isn't strictly enforced yet or headers are ignored in dev usually, but let's try basic fetch.
        // If auth required, we might need a key. For now, try simple fetch.
        // Actually, local dev usually needs publishable key for store routes? 
        // Let's assume user has `npm run dev` running.
    })

    // Actually, we can just use the internal sync logs or assume an ID if the server is running with auth.
    // But wait, the user's server is running. I am an agent. I can't easily fetch from localhost:9000 if I am inside the container unless network is open.
    // BUT `run_command` executes on the user's machine. So `curl` works.
}

// Rewriting this as a Medusa Script to run via `npx medusa exec` which is safer/easier for internal access.
export default async function (maybeContainer) {
    let container = maybeContainer
    if (maybeContainer.container) container = maybeContainer.container

    const reviewService = container.resolve("reviews")
    const remoteQuery = container.resolve("remoteQuery")

    // 1. Get a product
    const query = { entryPoint: "product", fields: ["id", "title"], variables: { limit: 1 } }
    const res = await remoteQuery(query)
    const products = Array.isArray(res) ? res : (res.rows || res.data || [])
    const product = products[0]

    if (!product) { console.log("No products found."); return; }

    console.log(`Testing with Product: ${product.title} (${product.id})`)

    // 2. Create Review (Service level simulation or internal call)
    console.log("Creating pending review...")
    const review = await reviewService.createReviews({
        rating: 5,
        comment: "Great product!",
        product_id: product.id,
        status: "pending"
    })
    console.log("Review created:", review.id, review.status)

    // 3. List Admin (Pending)
    const [pendingList] = await reviewService.listAndCountReviews({ status: 'pending' })
    const foundPending = pendingList.find(r => r.id === review.id)
    if (foundPending) console.log("Verified: Review is pending.")
    else console.error("Error: Review not found in pending list.")

    // 4. Approve
    console.log("Approving review...")
    await reviewService.updateReviews({ id: review.id, status: 'approved' })

    // 5. List Store (Approved)
    const [approvedList] = await reviewService.listAndCountReviews({ status: 'approved', product_id: product.id })
    const foundApproved = approvedList.find(r => r.id === review.id)
    if (foundApproved) console.log("Verified: Review is approved and linked to product.")
    else console.error("Error: Review not found in approved list.")
}
