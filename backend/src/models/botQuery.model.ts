import mongoose, { Schema, Model } from "mongoose";

type BotQueryDocument = mongoose.Document & {
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const botQuerySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "bot_queries", timestamps: true }
);

// Index to help query by user and createdAt range
botQuerySchema.index({ user: 1, createdAt: -1 });

const BotQuery: Model<BotQueryDocument> = mongoose.model<BotQueryDocument>(
  "BotQuery",
  botQuerySchema
);

export { BotQuery };


