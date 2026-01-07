import { createContainer } from "@medusajs/medusa"

async function main() {
  const container = await createContainer()
  const catRepo = container.resolve("categoryRepository") as any
  const qb = catRepo.createQueryBuilder("c")
  qb.where("c.metadata ->> 'synced_from' = :src", { src: "dummyjson" })
  const categories = await qb.getMany()

  const collRepo = container.resolve("productCollectionRepository") as any
  const qb2 = collRepo.createQueryBuilder("p")
  qb2.where("p.metadata ->> 'synced_from' = :src", { src: "dummyjson" })
  const collections = await qb2.getMany()

  console.log(`Categories (synced from dummyjson): ${categories.length}`)
  for (const c of categories) {
    console.log(`- ${c.id} : ${c.name} (handle: ${c.handle})`)
  }

  console.log(`\nCollections (synced from dummyjson): ${collections.length}`)
  for (const c of collections) {
    console.log(`- ${c.id} : ${c.title} (handle: ${c.handle})`)
  }

  process.exit(0)
}

if (require.main === module) main()
