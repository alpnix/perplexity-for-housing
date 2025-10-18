import mongoose, { Schema, Model } from "mongoose";

type AgentDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  name: string;
  query: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastExecuted?: Date;
  nextExecution: Date;
  executionCount: number;
  lastResults?: {
    houses?: any[];
    roommates?: any[];
    laws?: any[];
    summary?: string;
    executedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};

const agentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    query: { type: String, required: true },
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'], 
      required: true,
      default: 'weekly'
    },
    isActive: { type: Boolean, default: true },
    lastExecuted: { type: Date },
    nextExecution: { type: Date, required: true },
    executionCount: { type: Number, default: 0 },
    lastResults: {
      houses: [{ type: Schema.Types.Mixed }],
      roommates: [{ type: Schema.Types.Mixed }],
      laws: [{ type: Schema.Types.Mixed }],
      summary: { type: String },
      executedAt: { type: Date }
    }
  },
  { collection: "agents", timestamps: true }
);

// Indexes for efficient querying
agentSchema.index({ user: 1, isActive: 1 });
agentSchema.index({ nextExecution: 1, isActive: 1 });
agentSchema.index({ user: 1, createdAt: -1 });

const Agent: Model<AgentDocument> = mongoose.model<AgentDocument>(
  "Agent",
  agentSchema
);

export { Agent, AgentDocument };
