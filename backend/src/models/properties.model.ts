import mongoose, { Schema, Model } from "mongoose";
import { PropertyDocument } from "../@types/custom";

const propertySchema = new Schema({
  name: { type: String, required: true },
  propertyLocation: {
    place_id: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  price: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  sqft: { type: Number, default: null },
  type: {
    type: String,
    enum: ["house", "apartment", "villa", "condo", "studio"],
    required: true,
  },
  image: { type: String, required: true },
  description: { type: String, default: "" },
  amenities: [{ type: String }],
},
  { collection: "properties", timestamps: true }
);

const Property: Model<PropertyDocument> = mongoose.model<PropertyDocument>("Property", propertySchema);

export { Property };
