import { Router } from "express";
import { listMatches, getMessagesForMatch, sendMessageToMatch } from "../controllers/chat.controller";
import authMiddleware from "../middlewares/auth.middleware";

const chatRouter = Router();

chatRouter.get("/matches", authMiddleware, listMatches);
chatRouter.get("/matches/:matchId/messages", authMiddleware, getMessagesForMatch);
chatRouter.post("/matches/:matchId/messages", authMiddleware, sendMessageToMatch);

export default chatRouter;