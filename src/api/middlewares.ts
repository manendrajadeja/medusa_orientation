import {
    defineMiddlewares,
    validateAndTransformBody,
  } from "@medusajs/framework/http";
  import { createBrandValidator } from "./admin/brands/validators";
  
  export default defineMiddlewares({
    routes: [
      {
        matcher: "/admin/brands",
        method: "POST",
        middlewares: [validateAndTransformBody(createBrandValidator)],
      },
    ],
  });