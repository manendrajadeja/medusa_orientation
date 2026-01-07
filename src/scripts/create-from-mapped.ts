import fs from "fs"
import path from "path"

async function main() {
  const pathToFile = path.resolve(process.cwd(), "tmp/sync-products-mapped.json")
  if (!fs.existsSync(pathToFile)) {
    console.error("No mapped file found at tmp/sync-products-mapped.json — run job in VERBOSE dry-run first.")
    process.exit(1)
  }

  const content = fs.readFileSync(pathToFile, "utf8")
  const lines = content.trim().split("\n").filter(Boolean)
  if (!lines.length) {
    console.error("No mapped products found in tmp/sync-products-mapped.json")
    process.exit(1)
  }

  const lineArg = process.argv[2]
  const index = lineArg ? parseInt(lineArg, 10) : 0
  if (Number.isNaN(index) || index < 0 || index >= lines.length) {
    console.error(`Invalid index ${lineArg}; must be between 0 and ${lines.length - 1}`)
    console.error("Usage: npx medusa exec src/scripts/create-from-mapped.ts <index>")
    process.exit(1)
  }

  let mapped: any
  try {
    mapped = JSON.parse(lines[index])
  } catch (err: any) {
    console.error("Failed to parse mapped JSON at line", index, err?.message || err)
    console.error("Preview of first lines:", lines.slice(0, Math.min(5, lines.length)).join("\n"))
    process.exit(1)
  }

  const { createContainer } = await import("@medusajs/medusa")
  const { batchProductsWorkflow } = await import("@medusajs/medusa/core-flows")
  const container = await createContainer()
  try {
    const run = await batchProductsWorkflow(container).run({ input: { create: [mapped] } })
    console.log("Create run result:", run)
  } catch (err: any) {
    console.error("Create failed:", err?.message || err)
    process.exit(1)
  }
  process.exit(0)
}

if (require.main === module) main()
