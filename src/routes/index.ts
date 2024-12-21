import { Router } from "express";
import businessRouter from "./business.routes";
import authRouter from "./auth.routes";

const routes = Router();

routes.use("/", businessRouter);
routes.use("/auth", authRouter);

export default routes;
