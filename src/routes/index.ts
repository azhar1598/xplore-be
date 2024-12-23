import { Router } from "express";
import businessRouter from "./business.routes";
import authRouter from "./auth.routes";
import { authMiddleware } from "../middlewares/auth";

const routes = Router();
routes.use(authMiddleware);

routes.use("/", businessRouter);
// routes.use("/auth", authRouter);

export default routes;
