# DummyJSON Sync Widget

DEPRECATED: Admin widget removed — prefer the lightweight API and CLI scripts.

Use the admin API `GET /admin/sync/dummyjson` to list synced categories and collections,
and `POST /admin/sync/dummyjson` to trigger a background sync. Or run the CLI:

- `npm run list-synced` — lists synced categories and collections in your terminal.
- `npm run run-sync-full` — runs the sync job with a full Medusa container (creates categories & collections and links products).
