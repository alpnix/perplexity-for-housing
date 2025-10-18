import { Router } from "express";
import { 
  getRecommendedRoommates, 
  updateRoommateStatus, 
  getRoommatesByStatus, 
  getRoommateInterests,
  deleteRoommateInterestForPair,
} from "../controllers/roommates.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { validateRoommateStatusUpdate } from "../validations/roommates.validator";


const roommatesRouter = Router();

roommatesRouter.get("/recommended", authMiddleware, getRecommendedRoommates);

roommatesRouter.put("/status", authMiddleware, validateRoommateStatusUpdate, updateRoommateStatus);

roommatesRouter.get("/status/:status", authMiddleware, getRoommatesByStatus);

roommatesRouter.get("/interests", authMiddleware, getRoommateInterests);

// Delete roommate interest pair between current user and target
roommatesRouter.delete("/interests/:targetUserId", authMiddleware, deleteRoommateInterestForPair);

export default roommatesRouter;

