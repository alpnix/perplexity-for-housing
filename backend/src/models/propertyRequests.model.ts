import mongoose, { Schema, Model } from "mongoose";
import { PropertyRequestDocument } from "../@types/custom";

const propertyRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
  status: {
    type: String,
    enum: ["draft", "pending", "not-interested", "accepted", "rejected"],
    default: "pending",
  },
  roommate: { type: Schema.Types.ObjectId, ref: "User" },
  appliedAt: { type: Date, default: Date.now },
},
  { collection: "property_requests", timestamps: true }
);

const PropertyRequest: Model<PropertyRequestDocument> = mongoose.model<PropertyRequestDocument>("PropertyRequest", propertyRequestSchema);

export { PropertyRequest };
