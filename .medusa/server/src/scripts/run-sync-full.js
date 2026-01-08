"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_products_1 = __importDefault(require("../jobs/sync-products"));
(async () => {
    try {
        const mod = await import("@medusajs/medusa");
        // Try several common locations for createContainer
        const candidates = [
            mod.createContainer,
            mod.default && mod.default.createContainer,
            mod.app && mod.app.createContainer,
            mod.default,
            mod,
        ].filter(Boolean);
        let createContainerFn = null;
        for (const c of candidates) {
            if (typeof c === "function") {
                createContainerFn = c;
                break;
            }
        }
        if (!createContainerFn) {
            // Try require fallback (CJS interop)
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const req = require("@medusajs/medusa");
                if (req && typeof req.createContainer === "function")
                    createContainerFn = req.createContainer;
            }
            catch (e) {
                // ignore
            }
        }
        if (!createContainerFn) {
            throw new Error("Could not resolve createContainer from @medusajs/medusa. Run the Medusa server (npm run dev) and trigger the sync via the Admin endpoint POST /admin/sync/dummyjson or run this script within a Medusa runtime.");
        }
        const container = await createContainerFn();
        // Run a real sync (ensure DRY_RUN is not set)
        await (0, sync_products_1.default)(container);
        console.log("Full sync completed");
        process.exit(0);
    }
    catch (e) {
        console.error("Full sync failed:", e?.message || e);
        process.exit(1);
    }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLXN5bmMtZnVsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3J1bi1zeW5jLWZ1bGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwwRUFFQztBQUFBLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDWCxJQUFJLENBQUM7UUFDSCxNQUFNLEdBQUcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBUSxDQUFBO1FBRW5ELG1EQUFtRDtRQUNuRCxNQUFNLFVBQVUsR0FBRztZQUNqQixHQUFHLENBQUMsZUFBZTtZQUNuQixHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZTtZQUMxQyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZTtZQUNsQyxHQUFHLENBQUMsT0FBTztZQUNYLEdBQUc7U0FDSixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUVqQixJQUFJLGlCQUFpQixHQUFRLElBQUksQ0FBQTtRQUNqQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzNCLElBQUksT0FBTyxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQzVCLGlCQUFpQixHQUFHLENBQUMsQ0FBQTtnQkFDckIsTUFBSztZQUNQLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDdkIscUNBQXFDO1lBQ3JDLElBQUksQ0FBQztnQkFDSCw4REFBOEQ7Z0JBQzlELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBUSxDQUFBO2dCQUM5QyxJQUFJLEdBQUcsSUFBSSxPQUFPLEdBQUcsQ0FBQyxlQUFlLEtBQUssVUFBVTtvQkFBRSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFBO1lBQy9GLENBQUM7WUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNYLFNBQVM7WUFDWCxDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQ2IsaU5BQWlOLENBQ2xOLENBQUE7UUFDSCxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxpQkFBaUIsRUFBRSxDQUFBO1FBQzNDLDhDQUE4QztRQUM5QyxNQUFNLElBQUEsdUJBQWUsRUFBQyxTQUFTLENBQUMsQ0FBQTtRQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBQUMsT0FBTyxDQUFNLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7UUFDbkQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNqQixDQUFDO0FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQSJ9