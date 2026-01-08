"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRAND_MODULE = void 0;
// src/modules/brand/index.ts
const utils_1 = require("@medusajs/framework/utils");
const service_1 = __importDefault(require("./service"));
exports.BRAND_MODULE = "brand";
exports.default = (0, utils_1.Module)(exports.BRAND_MODULE, {
    service: service_1.default,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9icmFuZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw2QkFBNkI7QUFDN0IscURBQWtEO0FBQ2xELHdEQUEwQztBQUU3QixRQUFBLFlBQVksR0FBRyxPQUFPLENBQUE7QUFDbkMsa0JBQWUsSUFBQSxjQUFNLEVBQUMsb0JBQVksRUFBRTtJQUNsQyxPQUFPLEVBQUUsaUJBQWtCO0NBQzVCLENBQUMsQ0FBQSJ9