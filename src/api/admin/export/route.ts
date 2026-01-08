
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs/promises"
import path from "path"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const container = req.scope
    const remoteQuery = container.resolve("remoteQuery")

    try {
        const query = {
            entryPoint: "product",
            fields: [
                "id",
                "title",
                "handle",
                "status",
                "variants.title",
                "variants.prices.amount",
                "variants.prices.currency_code"
            ],
            variables: { limit: 1000 } // Adjust limit as needed or handle pagination
        }

        const result = await remoteQuery(query)
        const products = Array.isArray(result) ? result : (result.rows || result.data || [])

        // -----------------------------------------------------------------------------
        // CONSTRUCT THE CSV CONTENT
        // -----------------------------------------------------------------------------

        // Define CSV Headers
        const header = ["ID", "Handle", "Title", "Status", "Variant", "Price (Cent amount)", "Currency"]
        const rows = [header.join(",")]

        // Iterate through all products to build rows
        for (const p of products) {
            // Case 1: Product has no variants (unlikely but possible)
            if (!p.variants || p.variants.length === 0) {
                // Escape title quotes to prevent CSV breakage
                rows.push(`${p.id},${p.handle},"${p.title.replace(/"/g, '""')}",${p.status},,,`)
                continue
            }

            // Case 2: Iterate through each variant to create a row per variant
            for (const v of p.variants) {
                // Handle cases where a variant might lack a price
                if (!v.prices || v.prices.length === 0) {
                    rows.push(`${p.id},${p.handle},"${p.title.replace(/"/g, '""')}",${p.status},"${v.title.replace(/"/g, '""')}",,`)
                    continue
                }
                // Case 3: Create a row for each Price of each Variant
                for (const price of v.prices) {
                    rows.push(`${p.id},${p.handle},"${p.title.replace(/"/g, '""')}",${p.status},"${v.title.replace(/"/g, '""')}",${price.amount},${price.currency_code}`)
                }
            }
        }

        // Combine all rows into a single string separated by newlines
        const csvContent = rows.join("\n")

        // -----------------------------------------------------------------------------
        // SAVE AND SEND FILE
        // -----------------------------------------------------------------------------

        // Use 'uploads' directory to ensure file watchers ignore it (prevents server restart)
        const exportDir = path.resolve(process.cwd(), "uploads", "exports")
        await fs.mkdir(exportDir, { recursive: true })

        // Generate unique filename with timestamp
        const filename = `products-export-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`
        const filePath = path.join(exportDir, filename)

        // Write file to disk
        await fs.writeFile(filePath, csvContent)
        console.log(`Exported products to ${filePath}`)

        // Send the CSV content back in the HTTP response for download
        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
        res.send(csvContent)

    } catch (e: any) {
        console.error("Export failed:", e)
        res.status(500).json({ message: "Export failed", error: e.message })
    }
}
