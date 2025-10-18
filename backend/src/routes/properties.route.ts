import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getPropertyById, listProperties, setHouseInterest, listRealEstateAgents } from "../controllers/properties.controller";

const propertiesRouter = Router();

propertiesRouter.get("/", authMiddleware, listProperties);
propertiesRouter.get("/agents", authMiddleware, listRealEstateAgents);
propertiesRouter.get("/:id", authMiddleware, getPropertyById);
propertiesRouter.post("/:id/interest", authMiddleware, setHouseInterest);

export default propertiesRouter;
