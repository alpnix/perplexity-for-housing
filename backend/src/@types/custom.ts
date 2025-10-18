// @types/custom.ts
import mongoose from "mongoose";

export enum Role {
  LANDLORD = "LANDLORD",
  TENANT = "TENANT",
}

export enum SignupType {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
}

export interface UserInput {
  uid: string | null;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  signupType: SignupType;
}

interface Preference {
  name: string;
  value?: boolean;
}

interface Budget {
  min: number;
  max: number;
}

interface CitySuggestion {
  description: string;
  place_id: string;
}

export interface UserProfileUpdateInput {
  defaultRole?: Role;
  city?: CitySuggestion;
  dob?: string;
  gender?: string;
  openToRoommate?: boolean;
  interests?: string[];
  drinks?: boolean;
  smokes?: boolean;
  budget?: Budget;
  profileImage?: string; // base64 data URL
}

export interface LoginInput {
  uid: string | null;
  email: string;
  password?: string;
}

export interface UserDocument extends mongoose.Document {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  image?: string;
  defaultRole: Role;
  signupType: SignupType;
  isNewUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantProfileDocument extends Document {
  city?: {
    description: string;
    place_id: string;
  };
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  openToRoommate?: boolean;
  interests?: string[];
  budget?: {
    min: number;
    max: number;
  };
  drinks?: boolean;
  smokes?: boolean;
  profileImage?: string; // base64 data URL
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyDocument extends Document {
  name: string;
  propertyLocation: {
    place_id: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number | null;
  type: "house" | "apartment" | "villa" | "condo";
  image: string;
  description?: string;
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyRequestDocument extends Document {
  user: mongoose.Types.ObjectId;
  roommate?: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  status: "draft" | "pending" | "accepted" | "rejected" | "not-interested";
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConnectionDocument extends Document {
  user: mongoose.Types.ObjectId;
  targetUser: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "not-interested";
  requestInitiator?: mongoose.Types.ObjectId | null;
}

export interface GoogleUserInfo {
  email?: string;
  name?: string;  
}

export enum RoommateStatus {
  RECOMMENDED = "recommended",
  PENDING = "pending",
  ACCEPTED = "accepted",
  NOT_INTERESTED = "not-interested"
}

export interface MessageDocument extends mongoose.Document {
  _id: string;
  sender: mongoose.Schema.Types.ObjectId;
  match: mongoose.Schema.Types.ObjectId;
  content: string;
  isRead: boolean;
  // Optionally include timestamps if your schema uses them:
  createdAt?: Date;
  updatedAt?: Date;
}