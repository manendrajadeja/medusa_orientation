// Import necessary configuration helper from Admin SDK
import { defineWidgetConfig } from "@medusajs/admin-sdk"
// Import icons from Medusa UI library
import { EllipsisHorizontal } from "@medusajs/icons"
// Import UI components from Medusa Design System
import { Container, Heading, Text, Table, StatusBadge, DropdownMenu, IconButton, usePrompt, toast } from "@medusajs/ui"
// Import React hooks for state management and side effects
import { useState, useEffect } from "react"

// Define the shape of the Review data object
type Review = {
    id: string
    rating: number
    first_name: string
    last_name: string
    title: string
    content: string
    status: string // 'pending', 'approved', or 'rejected'
    created_at: string
}

// The main widget component. It receives `data` prop which contains the context (e.g. current product)
const ProductReviewsWidget = ({ data }: { data: { id: string } }) => {
    // State to store the list of reviews
    const [reviews, setReviews] = useState<Review[]>([])
    // State to track loading status
    const [loading, setLoading] = useState(true)
    // Hook to show confirmation dialogs
    const dialog = usePrompt()

    // Function to fetch reviews from the server
    const fetchReviews = async () => {
        // If there is no product ID, we cannot fetch reviews
        if (!data?.id) return
        try {
            // Make an API call to our new Admin API endpoint, filtering by product_id
            const res = await fetch(`/admin/reviews?product_id=${data.id}`)
            if (res.ok) {
                // Parse the JSON response
                const json = await res.json()
                // Update state with the fetched reviews
                setReviews(json.reviews || [])
            }
        } catch (e) {
            // Log error to console for debugging
            console.error("Failed to fetch reviews", e)
            // Show an error toast notification to the user
            toast.error("Error", { description: "Failed to fetch reviews" })
        } finally {
            // Always set loading to false when finished, whether success or fail
            setLoading(false)
        }
    }

    // Effect hook to trigger fetch when the component mounts or when product ID changes
    useEffect(() => {
        fetchReviews()
    }, [data?.id])

    // Handler function to update the status of a review (Approve/Reject)
    const handleStatusUpdate = async (id: string, newStatus: "approved" | "rejected") => {
        // Show a confirmation dialog to the user before proceeding
        const confirmed = await dialog({
            title: "Update Status",
            description: `Are you sure you want to change the status to ${newStatus}?`,
        })

        // If user cancels, stop execution
        if (!confirmed) return

        try {
            // Send POST request to update the review status
            const res = await fetch(`/admin/reviews/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                // Show success message
                toast.success("Success", { description: "Review status updated" })
                // Refresh the list to reflect changes immediately
                fetchReviews()
            } else {
                throw new Error("Failed to update")
            }
        } catch (e) {
            // Show error message if update failed
            toast.error("Error", { description: "Failed to update review status" })
        }
    }

    // Calculate Summary Statistics
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : "N/A"
    const pendingCount = reviews.filter(r => r.status === "pending").length

    return (
        // Container component provides standard styling/spacing
        <Container className="p-0 divide-y">
            {/* Widget Header Section with Summary Stats */}
            <div className="px-6 py-4 flex justify-between items-center">
                <div>
                    <Heading level="h2">Product Reviews</Heading>
                    <Text className="text-ui-fg-subtle" size="small">
                        Manage customer reviews and ratings.
                    </Text>
                </div>
                {/* Summary Badges */}
                <div className="flex gap-3">
                    <div className="p-2 bg-ui-bg-subtle rounded-md border border-ui-border-base flex flex-col items-center min-w-[80px]">
                        <Text size="xsmall" className="text-ui-fg-subtle">Avg Rating</Text>
                        <Text weight="plus">{averageRating} / 5</Text>
                    </div>
                    <div className="p-2 bg-ui-bg-subtle rounded-md border border-ui-border-base flex flex-col items-center min-w-[80px]">
                        <Text size="xsmall" className="text-ui-fg-subtle">Total</Text>
                        <Text weight="plus">{totalReviews}</Text>
                    </div>
                    {pendingCount > 0 && (
                        <div className="p-2 bg-orange-50 rounded-md border border-orange-200 flex flex-col items-center min-w-[80px]">
                            <Text size="xsmall" className="text-orange-700">Pending</Text>
                            <Text weight="plus" className="text-orange-700">{pendingCount}</Text>
                        </div>
                    )}
                </div>
            </div>

            {/* Conditional Rendering based on state */}
            {loading ? (
                // Loading State
                <div className="px-6 py-4">
                    <Text>Loading reviews...</Text>
                </div>
            ) : reviews.length === 0 ? (
                // Empty State
                <div className="px-6 py-4">
                    <Text className="text-ui-fg-subtle">No reviews yet for this product.</Text>
                </div>
            ) : (
                // List State: Render a Table
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Date</Table.HeaderCell>
                            <Table.HeaderCell>Rating</Table.HeaderCell>
                            <Table.HeaderCell>Reviewer</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                            <Table.HeaderCell>Content</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {/* Iterate through reviews and render each row */}
                        {reviews.map((review) => (
                            <Table.Row key={review.id}>
                                <Table.Cell>
                                    <Text size="small" className="text-ui-fg-subtle">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="flex items-center gap-1">
                                        <Text>{review.rating}</Text>
                                        <span className="text-ui-fg-subtle">/ 5</span>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>{review.first_name} {review.last_name}</Table.Cell>
                                <Table.Cell>{review.title || "-"}</Table.Cell>
                                <Table.Cell className="max-w-[300px] truncate" title={review.content}>
                                    {review.content}
                                </Table.Cell>
                                <Table.Cell>
                                    {/* Status Badge with dynamic color based on status */}
                                    <StatusBadge color={
                                        review.status === "approved" ? "green" :
                                            review.status === "rejected" ? "red" : "blue"
                                    }>
                                        {review.status}
                                    </StatusBadge>
                                </Table.Cell>
                                <Table.Cell>
                                    {/* Action Menu (Three dots) */}
                                    <DropdownMenu>
                                        <DropdownMenu.Trigger asChild>
                                            <IconButton variant="transparent">
                                                <EllipsisHorizontal />
                                            </IconButton>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content>
                                            {/* Action: Approve */}
                                            <DropdownMenu.Item onClick={() => handleStatusUpdate(review.id, "approved")}>
                                                Approve
                                            </DropdownMenu.Item>
                                            {/* Action: Reject */}
                                            <DropdownMenu.Item onClick={() => handleStatusUpdate(review.id, "rejected")}>
                                                Reject
                                            </DropdownMenu.Item>
                                        </DropdownMenu.Content>
                                    </DropdownMenu>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            )}
        </Container>
    )
}

// Configuration to inject this widget into the Admin UI
// ZONE: "product.details.after" means this widget appears immediately after the main product details.
// other options: "product.details.before", "product.list.before", etc.
export const config = defineWidgetConfig({
    zone: "product.details.after",
})

export default ProductReviewsWidget
