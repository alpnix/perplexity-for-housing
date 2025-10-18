import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { ReactNode } from 'react';

// Next.js Types
export type NextPageWithLayout = NextPage & {
  getLayout?: () => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type ChildrenProps = {
  children: ReactNode;
};

// Auth Types
export type IToken = {
  accessToken: string;
  refreshToken?: string;
};

export interface DecodedToken {
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}

export interface AuthFormData {
  email: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  signupType?: string;
  uid?: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

export enum Role {
  LANDLORD = "LANDLORD",
  TENANT = "TENANT",
}

// User Types
export interface UserDocument {
  _id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  defaultRole?: Role;
  signupType?: string;
  isNewUser?: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurrentUserProps {
  currentUser?: {
    createdAt: string;
    updatedAt: string;
    emailVerified: string | null;
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    password: string | null;
    isAdmin: boolean;
  } | null;
}

// Tenant Profile Types
export interface TenantProfileDocument {
  city?: CitySuggestion;
  dob?: string;
  openToRoommate?: boolean;
  interests?: string[];
  budget?: { min: number; max: number } | string;
  drinks?: boolean;
  smokes?: boolean;
  gender?: string;
  profileImage?: string;
  user: string;
  connections: {
    user: string;
    status: "recommended" | "pending" | "accepted" | "not-interested";
    requestInitiator?: string | null;
  }[];
}

export interface UserProfile {
  user: UserDocument;
  tenantProfile: TenantProfileDocument | null;
}

export interface UserProfileUpdateInput {
  city?: CitySuggestion;
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
  profileImage?: string;
}

// Location Types
export interface CitySuggestion {
  description: string;
  place_id: string;
}

// Property Types
export interface Property {
  _id: string;
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
  type: string;
  image: string[];
  description?: string;
  amenities?: string[];
  createdAt: Date;
  updatedAt: Date;
  link?: string;
}

export interface House {
  id: string;
  title: string;
  image: string;
}

// Roommate Types
export interface Roommate {
  id: string;
  name: string;
  location: string;
  description: string;
  gender: string;
  hobbies: string[];
  status: "recommended" | "pending" | "accepted" | "not-interested";
  image?: string;
  requestInitiator?: string | null;
}

export interface RecommendedRoommateResponse {
  user: UserDocument;
  tenantProfile: TenantProfileDocument;
}

export interface RoommateByStatusResponse {
  user: UserDocument;
  tenantProfile: TenantProfileDocument | null;
  connectionStatus: "recommended" | "pending" | "accepted" | "not-interested";
  requestInitiator: string | null;
}

export interface StatusUpdateData {
  targetUserId: string;
  newStatus: "recommended" | "pending" | "accepted" | "not-interested";
}
