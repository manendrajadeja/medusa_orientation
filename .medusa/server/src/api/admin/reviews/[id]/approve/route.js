"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.POST = void 0;
const reviews_1 = require("../../../../../modules/reviews");
const POST = async (req, res) => {
    const reviewModuleService = req.scope.resolve(reviews_1.REVIEW_MODULE);
    const { id } = req.params;
    const review = await reviewModuleService.updateReviews({
        id,
        status: "approved"
    });
    res.json({ review });
};
exports.POST = POST;
exports.AUTHENTICATE = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3Jldmlld3MvW2lkXS9hcHByb3ZlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLDREQUE4RDtBQUV2RCxNQUFNLElBQUksR0FBRyxLQUFLLEVBQUUsR0FBa0IsRUFBRSxHQUFtQixFQUFFLEVBQUU7SUFDbEUsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyx1QkFBYSxDQUFDLENBQUE7SUFDNUQsTUFBTSxFQUFFLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFFekIsTUFBTSxNQUFNLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxhQUFhLENBQUM7UUFDbkQsRUFBRTtRQUNGLE1BQU0sRUFBRSxVQUFVO0tBQ3JCLENBQUMsQ0FBQTtJQUVGLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0FBQ3hCLENBQUMsQ0FBQTtBQVZZLFFBQUEsSUFBSSxRQVVoQjtBQUVZLFFBQUEsWUFBWSxHQUFHLEtBQUssQ0FBQSJ9