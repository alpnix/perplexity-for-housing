import { Router } from "express";
import {
  getUserAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgent,
  executeAgent,
  getAgentsToExecute
} from "../controllers/agent.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all agents for the authenticated user
router.get("/", getUserAgents);

// Create a new agent
router.post("/", createAgent);

// Get a specific agent
router.get("/:id", getAgent);

// Update an agent
router.put("/:id", updateAgent);

// Delete an agent
router.delete("/:id", deleteAgent);

// Execute an agent manually
router.post("/:id/execute", executeAgent);

// Get agents that need to be executed (for background jobs)
router.get("/system/pending", getAgentsToExecute);

export default router;
