import { Schema, model } from "mongoose";

export interface HouseDoc {
  _id?: any;
  Price?: number;
  Address?: string;
  Bedrooms?: number;
  Bathrooms?: number;
  Title?: string;
  Area?: number;
  Description?: string;
  RealEstate?: string;
  DetailsURL?: string;
  ImageURL?: string;
  __v?: number;
}

// Schema reflecting the interface fields above and existing 'houses' collection fields
const HouseSchema = new Schema(
  {
    _id: { type: String }, // Allow string IDs (UUIDs)
    Price: { type: Number },
    Address: { type: String },
    Bedrooms: { type: Number },
    Bathrooms: { type: Number },
    Title: { type: String },
    Area: { type: Number },
    Description: { type: String },
    RealEstate: { type: String },
    DetailsURL: { type: String },
    ImageURL: { type: String },
  },
  {
    collection: "houses",
    timestamps: true,
  }
);

export const House = model("House", HouseSchema);
