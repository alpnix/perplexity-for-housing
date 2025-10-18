import mongoose, { Schema, Model } from "mongoose";
import { Role, SignupType, UserDocument } from "../@types/custom";

const usersSchema = new Schema(
  {
    firstname: { type: Schema.Types.String, required: true },
    lastname: { type: Schema.Types.String, required: true },
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: false, select: false },
    defaultRole: {
      type: String,
      enum: Object.values(Role),
      default: Role.TENANT,
      required: true,
    },
    signupType: {
      type: String,
      enum: Object.values(SignupType),
      required: true,
    },
    isNewUser: { type: Schema.Types.Boolean, default: true, required: true },
    image: { type: Schema.Types.String, required: false }
  },
  { collection: "users", timestamps: true }
);

const User: Model<UserDocument> = mongoose.model<UserDocument>("User", usersSchema);

export { User };