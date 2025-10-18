import { Router } from "express";
import {
  getPropertyById,
} from "../controllers/properties.controller";
import authMiddleware from "../middlewares/auth.middleware";

const propertyRouter = Router();

propertyRouter.get("/:id", authMiddleware, getPropertyById);

export default propertyRouter;
