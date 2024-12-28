import { Router } from "express";
import businessRouter from "./business.routes";
import authRouter from "./auth.routes";
import { authMiddleware } from "../middlewares/auth";
import notificationRouter from "./notification.routes";
import { start } from "repl";
import startupRouter from "./startup.routes";

const routes = Router();
routes.use(authMiddleware);

routes.use("/startup", startupRouter);
routes.use("/business-insights", businessRouter);
routes.use("/notifications", notificationRouter);

export default routes;
