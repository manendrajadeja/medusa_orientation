import { MedusaContainer } from "@medusajs/framework/types"

export default async function inspectProduct(container: MedusaContainer, externalId: string) {
  const prodRepo = container.resolve("productRepository") as any
  const qb = prodRepo.createQueryBuilder("p")
  qb.where("p.metadata ->> 'external_id' = :id", { id: externalId })
  const prod = await qb.getOne()
  if (!prod) {
    console.log(`Product not found for external_id=${externalId}`)
    return
  }
  console.log("Product:", JSON.stringify(prod, null, 2))
  const variantRepo = container.resolve("productVariantRepository") as any
  const variants = await variantRepo.find({ where: { product_id: prod.id } })
  console.log("Variants (count=", variants.length, "):", JSON.stringify(variants, null, 2))
}

if (require.main === module) {
  const externalId = process.argv[2]
  if (!externalId) {
    console.error("Usage: npx medusa exec src/scripts/inspect-product.ts <external_id>")
    process.exit(1)
  }
  // Using medusa exec will inject container as first arg, but we need to resolve container
  ;(async () => {
    const { createContainer } = await import("@medusajs/medusa")
    const container = await createContainer()
    await inspectProduct(container, externalId)
    process.exit(0)
  })()
}
