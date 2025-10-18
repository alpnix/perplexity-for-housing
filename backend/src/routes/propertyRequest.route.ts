import { Router } from "express";
import {
  createPropertyRequest,
  approvePropertyRequest,
  rejectPropertyRequest,
} from "../controllers/propertyRequest.controller";
import authMiddleware from "../middlewares/auth.middleware";
import {
  validatePropertyRequest,
  validatePropertyRequestAction,
} from "../validations/propertyRequest.validator";

const propertyRequestRouter = Router();

propertyRequestRouter.post("/", authMiddleware, validatePropertyRequest, createPropertyRequest);
propertyRequestRouter.put("/:requestId/approve", authMiddleware, validatePropertyRequestAction, approvePropertyRequest);
propertyRequestRouter.delete("/:requestId/reject", authMiddleware, validatePropertyRequestAction, rejectPropertyRequest);

export default propertyRequestRouter;
