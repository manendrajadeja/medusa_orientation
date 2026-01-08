
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Badge } from "@medusajs/ui"
import { useState, useEffect } from "react"

// Types for our API response
type SyncStats = {
    categories: any[]
    collections: any[]
    last_synced_at: string | null
}

// Main SyncWidget Component
const SyncWidget = () => {
    // State to track the current status of the sync operation
    // 'idle': No action yet, 'syncing': In progress, 'success'/'error': Result states
    const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

    // State to hold the statistics fetched from the API
    const [stats, setStats] = useState<SyncStats | null>(null)

    // State to display the "Last Synced" time string
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

    // Helper function to fetch synchronization statistics from the server
    const fetchStats = async () => {
        try {
            const res = await fetch("/admin/sync")
            if (res.ok) {
                const data = await res.json()
                setStats(data)
                // If the backend provides a last sync time, update our state to show it
                if (data.last_synced_at) {
                    setLastSyncTime(new Date(data.last_synced_at).toLocaleTimeString())
                }
            }
        } catch (e) {
            console.error("Failed to fetch stats", e)
        }
    }

    // Effect hook: Fetch stats once when the component first mounts
    useEffect(() => {
        fetchStats()
    }, [])

    // Handler for the "Sync Now" button click
    const handleSync = async () => {
        // 1. Update UI to loading state
        setStatus("syncing")
        try {
            // 2. Trigger the sync process via POST request
            const res = await fetch("/admin/sync", {
                method: "POST"
            })
            if (res.ok) {
                // 3. Handle success: Update status and optimistically update timestamp for immediate feedback
                setStatus("success")
                setLastSyncTime(new Date().toLocaleString())

                // 4. REFRESH DELAY: Wait 2 seconds before refetching real stats.
                // This gives the background job a moment to start/work so the stats might update.
                setTimeout(fetchStats, 2000)
            } else {
                setStatus("error")
            }
        } catch (e) {
            setStatus("error")
        }
    }

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <div>
                    <Heading level="h2">DummyJSON Sync Status</Heading>
                    <Text className="text-ui-fg-subtle" size="small">
                        Monitor and trigger product synchronization.
                    </Text>
                </div>
                <div className="flex items-center gap-2">
                    {status === "syncing" && <Badge color="blue">Syncing...</Badge>}
                    {status === "success" && <Badge color="green">Sync Started</Badge>}
                    {status === "error" && <Badge color="red">Error</Badge>}
                </div>
            </div>
            <div className="px-6 py-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                        <Text size="small" className="font-medium text-ui-fg-subtle">Synced Categories</Text>
                        <Heading level="h2">{stats ? stats.categories.length : "-"}</Heading>
                    </div>
                    <div className="p-3 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
                        <Text size="small" className="font-medium text-ui-fg-subtle">Last Synced</Text>
                        <Heading level="h2">
                            {lastSyncTime}
                        </Heading>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <Text size="small" className="text-ui-fg-subtle">
                        {lastSyncTime ? `Last triggered: ${lastSyncTime}` : "Scheduled: After Every 2 Minutes"}
                    </Text>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => window.location.href = "/admin/export"}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSync}
                            disabled={status === "syncing"}
                        >
                            Sync Now
                        </Button>
                    </div>
                </div>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.list.before",
})

export default SyncWidget
