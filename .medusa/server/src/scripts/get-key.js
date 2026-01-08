"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const utils_1 = require("@medusajs/framework/utils");
async function default_1(maybeContainer) {
    let container = maybeContainer;
    if (maybeContainer.container)
        container = maybeContainer.container;
    const apiKeyService = container.resolve(utils_1.Modules.API_KEY);
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    // 1. List valid publishable keys
    const [keys] = await apiKeyService.listApiKeys({ type: "publishable" }, { take: 1 });
    if (keys.length > 0) {
        console.log("Found existing Publishable Key:");
        console.log(`Key: ${keys[0].token}`);
        console.log(`Title: ${keys[0].title}`);
        return;
    }
    // 2. If none, create one
    console.log("No Publishable Key found. Creating one...");
    const key = await apiKeyService.createApiKeys({
        title: "Development Key",
        type: "publishable",
        created_by: "system"
    });
    console.log("Created New Publishable Key:");
    console.log(`Key: ${key.token}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LWtleS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL2dldC1rZXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSw0QkEyQkM7QUE3QkQscURBQW1EO0FBRXBDLEtBQUssb0JBQVcsY0FBYztJQUN6QyxJQUFJLFNBQVMsR0FBRyxjQUFjLENBQUE7SUFDOUIsSUFBSSxjQUFjLENBQUMsU0FBUztRQUFFLFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFBO0lBRWxFLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3hELE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7SUFFcEUsaUNBQWlDO0lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLGFBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUVwRixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO1FBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTtRQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7UUFDdEMsT0FBTTtJQUNWLENBQUM7SUFFRCx5QkFBeUI7SUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0lBQ3hELE1BQU0sR0FBRyxHQUFHLE1BQU0sYUFBYSxDQUFDLGFBQWEsQ0FBQztRQUMxQyxLQUFLLEVBQUUsaUJBQWlCO1FBQ3hCLElBQUksRUFBRSxhQUFhO1FBQ25CLFVBQVUsRUFBRSxRQUFRO0tBQ3ZCLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQTtJQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7QUFDcEMsQ0FBQyJ9