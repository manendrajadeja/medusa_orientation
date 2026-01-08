import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export type DummyProduct = {
    id: number
    title: string
    description: string
    price: number
    category?: string
    thumbnail?: string
    images?: string[]
    discountPercentage?: number
    rating?: number
    stock?: number
    brand?: string
    weight?: number
    sku?: string
    warrantyInformation?: string
    shippingInformation?: string
    availabilityStatus?: string
    reviews?: any[]
    returnPolicy?: string
    minimumOrderQuantity?: number
    meta?: any
    tags?: string[]
}

export function slugify(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") // collapse dashes
}

export function mapProductToMedusaSchema(product: DummyProduct) {
    const handle = slugify(product.title)

    // If product has no explicit options, we create a default option so the product
    // passes Medusa's validation step (validateProductInputStep requires product options).
    const defaultOption = { title: "Default", values: ["Default"] }

    // Use images, fallback to thumbnail if empty
    let images: { url: string }[] = []
    if (product.images && product.images.length > 0) {
        images = product.images.map((src) => ({ url: src }))
    } else if (product.thumbnail) {
        images = [{ url: product.thumbnail }]
    }

    // Calculate review stats if available (dummyjson products have 'rating' and 'reviews' array usually)
    const reviewCount = product.reviews ? product.reviews.length : 0
    const reviewAverage = product.rating || 0

    const mapped: any = {
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
    }

    return mapped
}

// Enhanced query to find products by External ID OR Handle
export async function queryExistingProducts(container: MedusaContainer, externalIds: string[], handles: string[]) {
    const products: any[] = []

    // Attempt 1: Repository Query (fastest)
    try {
        const productRepository = container.resolve("productRepository") as any
        if (productRepository && typeof productRepository.createQueryBuilder === "function") {
            const qb = productRepository.createQueryBuilder("p")
            qb.where("p.metadata ->> 'external_id' IN (:...ids)", { ids: externalIds })
            qb.orWhere("p.handle IN (:...handles)", { handles })
            return await qb.getMany()
        }
    } catch (err) {
        // Repository access failed
    }

    // Attempt 2: Remote Query (Medusa v2 standard)
    try {
        const remoteQuery = container.resolve("remoteQuery")
        if (remoteQuery) {
            // Query by handle
            const query = {
                entryPoint: "product",
                fields: ["id", "handle", "metadata"],
                variables: {
                    filters: { handle: handles }
                }
            }
            const result = await remoteQuery(query)
            const byHandle = Array.isArray(result) ? result : (result.rows || result.data || [])

            if (Array.isArray(byHandle)) {
                products.push(...byHandle)
            }
        }
    } catch (err) {
        console.warn("Could not query existing products via remoteQuery:", err)
    }

    // Attempt 3: Legacy Service (fallback)
    if (products.length === 0) {
        try {
            const key = Modules.PRODUCT
            const productService = container.resolve(key) as any
            // Check for listProducts (v2 module) or list (v1 service)
            const listFn = productService.listProducts || productService.list
            if (typeof listFn === "function") {
                const byHandles = await listFn.bind(productService)({ handle: handles }, { take: handles.length })
                products.push(...byHandles)
            }
        } catch (err) {
            // ignore
        }
    }

    return products
}
