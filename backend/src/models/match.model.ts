import mongoose, { Schema, Model } from "mongoose";

interface MatchDocument extends mongoose.Document {
  user1: mongoose.Types.ObjectId;
  user2: mongoose.Types.ObjectId;
  uniqueId: string; // deterministic: sorted(user1,user2).join('_')
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<MatchDocument>(
  {
    user1: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user2: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: Schema.Types.String, required: true, unique: true },
  },
  { collection: "matches", timestamps: true }
);

const Match: Model<MatchDocument> = mongoose.model<MatchDocument>("Match", matchSchema);

export { Match, MatchDocument };


