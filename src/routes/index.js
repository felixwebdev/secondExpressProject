import userRouters from "./userRoutes.js";
import messageRouters from "./messageRoutes.js";

export default function router(app) {
    app.use("/api/users", userRouters);
    app.use("/api/messages", messageRouters);
}