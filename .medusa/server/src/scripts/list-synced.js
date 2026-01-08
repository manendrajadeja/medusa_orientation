"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const medusa_1 = require("@medusajs/medusa");
async function main() {
    const container = await (0, medusa_1.createContainer)();
    const catRepo = container.resolve("categoryRepository");
    const qb = catRepo.createQueryBuilder("c");
    qb.where("c.metadata ->> 'synced_from' = :src", { src: "dummyjson" });
    const categories = await qb.getMany();
    const collRepo = container.resolve("productCollectionRepository");
    const qb2 = collRepo.createQueryBuilder("p");
    qb2.where("p.metadata ->> 'synced_from' = :src", { src: "dummyjson" });
    const collections = await qb2.getMany();
    console.log(`Categories (synced from dummyjson): ${categories.length}`);
    for (const c of categories) {
        console.log(`- ${c.id} : ${c.name} (handle: ${c.handle})`);
    }
    console.log(`\nCollections (synced from dummyjson): ${collections.length}`);
    for (const c of collections) {
        console.log(`- ${c.id} : ${c.title} (handle: ${c.handle})`);
    }
    process.exit(0);
}
if (require.main === module)
    main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1zeW5jZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NyaXB0cy9saXN0LXN5bmNlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUFrRDtBQUVsRCxLQUFLLFVBQVUsSUFBSTtJQUNqQixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsd0JBQWUsR0FBRSxDQUFBO0lBQ3pDLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQVEsQ0FBQTtJQUM5RCxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDMUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQ3JFLE1BQU0sVUFBVSxHQUFHLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBRXJDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQVEsQ0FBQTtJQUN4RSxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDNUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQ3RFLE1BQU0sV0FBVyxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBRXZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZFLEtBQUssTUFBTSxDQUFDLElBQUksVUFBVSxFQUFFLENBQUM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksYUFBYSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUM1RCxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDM0UsS0FBSyxNQUFNLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsS0FBSyxhQUFhLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0lBQzdELENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLENBQUM7QUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTTtJQUFFLElBQUksRUFBRSxDQUFBIn0=