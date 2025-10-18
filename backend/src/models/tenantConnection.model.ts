// tenantConnection.model.ts
import mongoose, { Schema, Model } from "mongoose";
import { TenantConnectionDocument } from "../@types/custom";

const tenantConnectionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: Schema.Types.String,
      enum: ["pending", "accepted", "not-interested"],
      required: true,
    },
    requestInitiator: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { collection: "tenant_connections", timestamps: true }
);

tenantConnectionSchema.index({ user: 1, targetUser: 1 }, { unique: true });

const TenantConnection: Model<TenantConnectionDocument> = 
  mongoose.model<TenantConnectionDocument>("TenantConnection", tenantConnectionSchema);

export { TenantConnection };