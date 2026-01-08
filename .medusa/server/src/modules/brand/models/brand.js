"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brand = void 0;
// src/modules/brand/models/brand.ts
const utils_1 = require("@medusajs/framework/utils");
exports.Brand = utils_1.model.define("brand", {
    id: utils_1.model.id().primaryKey(),
    name: utils_1.model.text(),
    description: utils_1.model.text().nullable(),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9icmFuZC9tb2RlbHMvYnJhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0NBQW9DO0FBQ3BDLHFEQUFpRDtBQUVwQyxRQUFBLEtBQUssR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtJQUN6QyxFQUFFLEVBQUUsYUFBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsRUFBRTtJQUMzQixJQUFJLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRTtJQUNsQixXQUFXLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNyQyxDQUFDLENBQUEifQ==