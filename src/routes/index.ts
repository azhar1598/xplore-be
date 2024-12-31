import { Router } from "express";
import businessRouter from "./business.routes";
import authRouter from "./auth.routes";
import { authMiddleware } from "../middlewares/auth";
import notificationRouter from "./notification.routes";
import startupRouter from "./startup.routes";

import startupPublicRouter from "./public/startup.routes";
import jobRouter from "./jobRouter";

const routes = Router();

// routes.use(authMiddleware);

routes.use("/startup", authMiddleware, startupRouter);
routes.use("/business-insights", authMiddleware, businessRouter);
routes.use("/notifications", authMiddleware, notificationRouter);
routes.use("/job", authMiddleware, jobRouter);
const publicRoutes = Router();

// public routes
publicRoutes.use("/startup", startupPublicRouter);

export { routes as protectedRoutes, publicRoutes };
