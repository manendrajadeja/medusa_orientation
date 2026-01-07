import { Modules } from "@medusajs/framework/utils"

export default async function (maybeContainer) {
    let container = maybeContainer
    if (maybeContainer.container) container = maybeContainer.container

    const apiKeyService = container.resolve(Modules.API_KEY)
    const salesChannelService = container.resolve(Modules.SALES_CHANNEL)

    // 1. List valid publishable keys
    const [keys] = await apiKeyService.listApiKeys({ type: "publishable" }, { take: 1 })

    if (keys.length > 0) {
        console.log("Found existing Publishable Key:")
        console.log(`Key: ${keys[0].token}`)
        console.log(`Title: ${keys[0].title}`)
        return
    }

    // 2. If none, create one
    console.log("No Publishable Key found. Creating one...")
    const key = await apiKeyService.createApiKeys({
        title: "Development Key",
        type: "publishable",
        created_by: "system"
    })

    console.log("Created New Publishable Key:")
    console.log(`Key: ${key.token}`)
}
