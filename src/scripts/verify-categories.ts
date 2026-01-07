import { Modules } from "@medusajs/framework/utils"

export default async function (container) {
    const remoteQuery = container.resolve("remoteQuery")
    const query = {
        entryPoint: "product_category",
        fields: ["name", "handle", "metadata"],
        variables: { limit: 100 }
    }
    const { rows } = await remoteQuery(query)
    console.log(`Found ${rows.length} categories.`)
    console.log(rows.map(r => `${r.name} (${r.handle})`).join("\n"))
}
