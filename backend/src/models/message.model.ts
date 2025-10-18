import mongoose, { Schema, Model } from "mongoose";
import { MessageDocument } from "../@types/custom";

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    content: { type: Schema.Types.String, required: true },
    isRead: { type: Schema.Types.Boolean, default: false },
  },
  { collection: "messages", timestamps: true }
);

const Message: Model<MessageDocument> = mongoose.model<MessageDocument>(
  "Message",
  messageSchema
);

export { Message };
