import { Request, Response } from "express";
import { Agent } from "../models";

// Helper function to calculate next execution date
const calculateNextExecution = (frequency: 'daily' | 'weekly' | 'monthly', fromDate = new Date()): Date => {
  const nextDate = new Date(fromDate);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }
  
  return nextDate;
};

// Get all agents for a user
export const getUserAgents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const agents = await Agent.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new agent
export const createAgent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, query, frequency = 'weekly' } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!name || !query) {
      res.status(400).json({ message: "Name and query are required" });
      return;
    }

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      res.status(400).json({ message: "Invalid frequency. Must be daily, weekly, or monthly" });
      return;
    }

    // Check if user already has too many agents (limit to 10)
    const existingAgentsCount = await Agent.countDocuments({ user: userId, isActive: true });
    if (existingAgentsCount >= 10) {
      res.status(400).json({ message: "Maximum of 10 active agents allowed" });
      return;
    }

    const nextExecution = calculateNextExecution(frequency);

    const agent = new Agent({
      user: userId,
      name: name.trim(),
      query: query.trim(),
      frequency,
      nextExecution,
      isActive: true,
      executionCount: 0
    });

    await agent.save();

    res.status(201).json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an agent
export const updateAgent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, query, frequency, isActive } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const agent = await Agent.findOne({ _id: id, user: userId });

    if (!agent) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    // Update fields if provided
    if (name !== undefined) agent.name = name.trim();
    if (query !== undefined) agent.query = query.trim();
    if (isActive !== undefined) agent.isActive = isActive;
    
    if (frequency !== undefined) {
      if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
        res.status(400).json({ message: "Invalid frequency. Must be daily, weekly, or monthly" });
        return;
      }
      agent.frequency = frequency;
      // Recalculate next execution if frequency changed
      agent.nextExecution = calculateNextExecution(frequency, agent.lastExecuted || new Date());
    }

    await agent.save();

    res.status(200).json(agent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete an agent
export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const agent = await Agent.findOneAndDelete({ _id: id, user: userId });

    if (!agent) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    res.status(200).json({ message: "Agent deleted successfully" });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific agent
export const getAgent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const agent = await Agent.findOne({ _id: id, user: userId }).lean();

    if (!agent) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    res.status(200).json(agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Execute an agent manually (for testing or immediate execution)
export const executeAgent = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const agent = await Agent.findOne({ _id: id, user: userId });

    if (!agent) {
      res.status(404).json({ message: "Agent not found" });
      return;
    }

    if (!agent.isActive) {
      res.status(400).json({ message: "Agent is not active" });
      return;
    }

    // TODO: Integrate with the bot controller to execute the query
    // For now, we'll just update the execution metadata
    const now = new Date();
    agent.lastExecuted = now;
    agent.executionCount += 1;
    agent.nextExecution = calculateNextExecution(agent.frequency, now);

    // Placeholder for actual execution results
    agent.lastResults = {
      houses: [],
      roommates: [],
      laws: [],
      summary: `Agent "${agent.name}" executed successfully at ${now.toISOString()}`,
      executedAt: now
    };

    await agent.save();

    res.status(200).json({
      message: "Agent executed successfully",
      agent,
      nextExecution: agent.nextExecution
    });
  } catch (error) {
    console.error("Error executing agent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get agents that need to be executed (for background job)
export const getAgentsToExecute = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const agents = await Agent.find({
      isActive: true,
      nextExecution: { $lte: now }
    }).populate('user', 'email name').lean();

    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching agents to execute:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
