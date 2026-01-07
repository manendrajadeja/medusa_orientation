import syncProductsJob from "../jobs/sync-products"

;(async () => {
  try {
    const mod = await import("@medusajs/medusa") as any

    // Try several common locations for createContainer
    const candidates = [
      mod.createContainer,
      mod.default && mod.default.createContainer,
      mod.app && mod.app.createContainer,
      mod.default,
      mod,
    ].filter(Boolean)

    let createContainerFn: any = null
    for (const c of candidates) {
      if (typeof c === "function") {
        createContainerFn = c
        break
      }
    }

    if (!createContainerFn) {
      // Try require fallback (CJS interop)
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const req = require("@medusajs/medusa") as any
        if (req && typeof req.createContainer === "function") createContainerFn = req.createContainer
      } catch (e) {
        // ignore
      }
    }

    if (!createContainerFn) {
      throw new Error(
        "Could not resolve createContainer from @medusajs/medusa. Run the Medusa server (npm run dev) and trigger the sync via the Admin endpoint POST /admin/sync/dummyjson or run this script within a Medusa runtime."
      )
    }

    const container = await createContainerFn()
    // Run a real sync (ensure DRY_RUN is not set)
    await syncProductsJob(container)
    console.log("Full sync completed")
    process.exit(0)
  } catch (e: any) {
    console.error("Full sync failed:", e?.message || e)
    process.exit(1)
  }
})()
