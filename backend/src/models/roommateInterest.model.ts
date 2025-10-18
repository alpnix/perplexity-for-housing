import mongoose, { Schema, Model } from "mongoose";

interface RoommateInterestDocument extends mongoose.Document {
  initiator: mongoose.Types.ObjectId; // user who initiated the action
  recipient: mongoose.Types.ObjectId; // target user
  status: "connection" | "not-interested";
  createdAt: Date;
  updatedAt: Date;
}

const roommateInterestSchema = new Schema<RoommateInterestDocument>(
  {
    initiator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: Schema.Types.String,
      enum: ["connection", "not-interested"],
      required: true,
    },
  },
  { collection: "roommate_interests", timestamps: true }
);

const RoommateInterest: Model<RoommateInterestDocument> =
  mongoose.model<RoommateInterestDocument>("RoommateInterest", roommateInterestSchema);

export { RoommateInterest, RoommateInterestDocument };


