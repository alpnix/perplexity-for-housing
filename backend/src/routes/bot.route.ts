import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { answerPrompt, getUsage } from "../controllers/bot.controller";

const botRouter = Router();

botRouter.post("/", authMiddleware, answerPrompt);
botRouter.get("/usage", authMiddleware, getUsage);

export default botRouter;
