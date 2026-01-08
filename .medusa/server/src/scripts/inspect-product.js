"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = inspectProduct;
async function inspectProduct(container, externalId) {
    const prodRepo = container.resolve("productRepository");
    const qb = prodRepo.createQueryBuilder("p");
    qb.where("p.metadata ->> 'external_id' = :id", { id: externalId });
    const prod = await qb.getOne();
    if (!prod) {
        console.log(`Product not found for external_id=${externalId}`);
        return;
    }
    console.log("Product:", JSON.stringify(prod, null, 2));
    const variantRepo = container.resolve("productVariantRepository");
    const variants = await variantRepo.find({ where: { product_id: prod.id } });
    console.log("Variants (count=", variants.length, "):", JSON.stringify(variants, null, 2));
}
if (require.main === module) {
    const externalId = process.argv[2];
    if (!externalId) {
        console.error("Usage: npx medusa exec src/scripts/inspect-product.ts <external_id>");
        process.exit(1);
    }
    // Using medusa exec will inject container as first arg, but we need to resolve container
    ;
    (async () => {
        const { createContainer } = await import("@medusajs/medusa");
        const container = await createContainer();
        await inspectProduct(container, externalId);
        process.exit(0);
    })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdC1wcm9kdWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjcmlwdHMvaW5zcGVjdC1wcm9kdWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsaUNBYUM7QUFiYyxLQUFLLFVBQVUsY0FBYyxDQUFDLFNBQTBCLEVBQUUsVUFBa0I7SUFDekYsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBUSxDQUFBO0lBQzlELE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUMzQyxFQUFFLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUE7SUFDbEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDOUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsVUFBVSxFQUFFLENBQUMsQ0FBQTtRQUM5RCxPQUFNO0lBQ1IsQ0FBQztJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3RELE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQVEsQ0FBQTtJQUN4RSxNQUFNLFFBQVEsR0FBRyxNQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMzRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzNGLENBQUM7QUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQUM7SUFDNUIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNsQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxxRUFBcUUsQ0FBQyxDQUFBO1FBQ3BGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakIsQ0FBQztJQUNELHlGQUF5RjtJQUN6RixDQUFDO0lBQUEsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNYLE1BQU0sRUFBRSxlQUFlLEVBQUUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQzVELE1BQU0sU0FBUyxHQUFHLE1BQU0sZUFBZSxFQUFFLENBQUE7UUFDekMsTUFBTSxjQUFjLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQzNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNOLENBQUMifQ==