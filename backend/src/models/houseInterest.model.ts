import mongoose, { Schema, Model } from "mongoose";

export interface HouseInterestDocument extends mongoose.Document {
  user: mongoose.Types.ObjectId; // user who set interest
  house: string; // references House._id (string)
  status: "interested" | "not-interested";
  uniqueId: string;
  createdAt: Date;
  updatedAt: Date;
}

const houseInterestSchema = new Schema<HouseInterestDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    house: { type: String, ref: "House", required: true, index: true },
    status: {
      type: String,
      enum: ["interested", "not-interested"],
      required: true,
    },
    uniqueId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
      unique: true,
      index: true,
    },
  },
  { collection: "house_interests", timestamps: true }
);

// Ensure one interest per user-house pair
houseInterestSchema.index({ user: 1, house: 1 }, { unique: true });

const HouseInterest: Model<HouseInterestDocument> =
  mongoose.model<HouseInterestDocument>("HouseInterest", houseInterestSchema);

export { HouseInterest };