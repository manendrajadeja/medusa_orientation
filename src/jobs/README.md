# Custom scheduled jobs

A scheduled job is a function executed at a specified interval of time in the background of your Medusa application.

> Learn more about scheduled jobs in [this documentation](https://docs.medusajs.com/learn/fundamentals/scheduled-jobs).

A scheduled job is created in a TypeScript or JavaScript file under the `src/jobs` directory.

For example, create the file `src/jobs/hello-world.ts` with the following content:

```ts
import {
  MedusaContainer
} from "@medusajs/framework/types";

export default async function myCustomJob(container: MedusaContainer) {
  const productService = container.resolve("product")

  const products = await productService.listAndCountProducts();

  // Do something with the products
}

export const config = {
  name: "daily-product-report",
  schedule: "0 0 * * *", // Every day at midnight
};
```

A scheduled job file must export:

- The function to be executed whenever it’s time to run the scheduled job.
- A configuration object defining the job. It has three properties:
  - `name`: a unique name for the job.
  - `schedule`: a [cron expression](https://crontab.guru/).
  - `numberOfExecutions`: an optional integer, specifying how many times the job will execute before being removed

The `handler` is a function that accepts one parameter, `container`, which is a `MedusaContainer` instance used to resolve services.

---

## sync-products job

This repository includes a `sync-products` scheduled job that fetches products from DummyJSON (https://dummyjson.com/products) and syncs them into Medusa using the `batchProductsWorkflow`.

- File: `src/jobs/sync-products.ts`
- Schedule: every 2 minutes by default (`*/2 * * * *`) — override with `SYNC_PRODUCTS_SCHEDULE` env var

Environment variables:
- `SYNC_PRODUCTS_BATCH_SIZE` (default: 15)
- `SYNC_PRODUCTS_MAX_RETRIES` (default: 2)
- `SYNC_PRODUCTS_SCHEDULE` (optional cron string, default `*/2 * * * *`)
- `SYNC_PRODUCTS_DRY_RUN` (default: false)

Run it locally:

npx medusa exec dist/jobs/sync-products.js

Tests:

npm test -- integration-tests/sync-products.spec.ts
