"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const create_brand_1 = require("../../../workflows/create-brand");
// POST /admin/brands
const POST = async (req, res) => {
    const { result } = await (0, create_brand_1.createBrandWorkflow)(req.scope).run({
        input: req.validatedBody,
    });
    res.json({ brand: result });
};
exports.POST = POST;
// GET /admin/brands
const GET = async (req, res) => {
    const query = req.scope.resolve("query");
    const { data } = await query.graph({
        entity: "brand",
        fields: ["id", "name"],
    });
    res.json({ brands: data });
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2JyYW5kcy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxrRUFBcUU7QUFNckUscUJBQXFCO0FBQ2QsTUFBTSxJQUFJLEdBQUcsS0FBSyxFQUN2QixHQUFtQyxFQUNuQyxHQUFtQixFQUNuQixFQUFFO0lBQ0YsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sSUFBQSxrQ0FBbUIsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzFELEtBQUssRUFBRSxHQUFHLENBQUMsYUFBYTtLQUN6QixDQUFDLENBQUE7SUFFRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUE7QUFDNUIsQ0FBQyxDQUFBO0FBVFksUUFBQSxJQUFJLFFBU2hCO0FBRUQsb0JBQW9CO0FBQ2IsTUFBTSxHQUFHLEdBQUcsS0FBSyxFQUFFLEdBQW1DLEVBQUUsR0FBbUIsRUFBRSxFQUFFO0lBQ3BGLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3hDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDakMsTUFBTSxFQUFFLE9BQU87UUFDZixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO0tBQ3ZCLENBQUMsQ0FBQTtJQUNGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUM1QixDQUFDLENBQUE7QUFQWSxRQUFBLEdBQUcsT0FPZiJ9