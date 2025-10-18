// tenantProfile.model.ts
import mongoose, { Schema, Model } from "mongoose";
import { TenantProfileDocument } from "../@types/custom";

const budgetSchema = new Schema(
  {
    min: { type: Schema.Types.Number, required: true },
    max: { type: Schema.Types.Number, required: true },
  },
  { _id: false }
);

const citySuggestionSchema = new Schema(
  {
    description: { type: Schema.Types.String, required: true },
    place_id: { type: Schema.Types.String, required: true },
  },
  { _id: false }
);

const tenantProfileSchema = new Schema(
  {
    city: { type: citySuggestionSchema, required: false },
    dob: { type: Schema.Types.String, required: false },
    gender: { type: Schema.Types.String, enum: ["Male", "Female", "Other"], required: false },
    openToRoommate: { type: Schema.Types.Boolean, required: false },
    interests: { type: [Schema.Types.String], required: false },
    budget: { type: budgetSchema, required: false },
    drinks: { type: Schema.Types.Boolean, required: false },
    smokes: { type: Schema.Types.Boolean, required: false },
    profileImage: { type: Schema.Types.String, required: false },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { collection: "tenant_profiles", timestamps: true }
);

const TenantProfile: Model<TenantProfileDocument> = 
  mongoose.model<TenantProfileDocument>("TenantProfile", tenantProfileSchema);

export { TenantProfile };