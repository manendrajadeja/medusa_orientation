"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostReviewSchema = void 0;
const zod_1 = require("zod");
exports.PostReviewSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().optional(),
    product_id: zod_1.z.string(),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvc3RvcmUvcmV2aWV3cy92YWxpZGF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF1QjtBQUVWLFFBQUEsZ0JBQWdCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNyQyxNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLE9BQU8sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzlCLFVBQVUsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0NBQ3pCLENBQUMsQ0FBQSJ9