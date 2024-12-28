import { StartupController } from "../controllers/startup.controller";
import { Router } from "express";

const startupRouter = Router();
const startupController: any = new StartupController();

// startupRouter.get("/startups", (req: any, res: any) =>
//     startupController.getBusinessInsights(req, res)
// );

startupRouter.post("/", (req: any, res: any) =>
  startupController.createStartup(req, res)
);

startupRouter.get("/", (req: any, res: any) =>
  startupController.getStartups(req, res)
);

export default startupRouter;
