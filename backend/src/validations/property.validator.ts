import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { errorResponse } from "../utils/api.response";

const createPropertySchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Property name is required",
    "any.required": "Property name is required",
  }),
  propertyLocation: Joi.object({
    place_id: Joi.string().required().messages({
      "string.empty": "Place ID is required",
      "any.required": "Place ID is required",
    }),
    address: Joi.string().required().messages({
      "string.empty": "Address is required",
      "any.required": "Address is required",
    }),
    coordinates: Joi.object({
      lat: Joi.number().required().messages({
        "number.base": "Latitude must be a number",
        "any.required": "Latitude is required",
      }),
      lng: Joi.number().required().messages({
        "number.base": "Longitude must be a number",
        "any.required": "Longitude is required",
      }),
    }).required(),
  }).required(),
  price: Joi.number().required().messages({
    "number.base": "Price must be a number",
    "any.required": "Price is required",
  }),
  bedrooms: Joi.number().integer().min(0).required().messages({
    "number.base": "Bedrooms must be a number",
    "any.required": "Bedrooms are required",
  }),
  bathrooms: Joi.number().integer().min(0).required().messages({
    "number.base": "Bathrooms must be a number",
    "any.required": "Bathrooms are required",
  }),
  sqft: Joi.number().optional(),
  type: Joi.string().valid("apartment", "house", "condo", "villa", "studio").required().messages({
    "any.only": "Invalid property type",
    "any.required": "Property type is required",
  }),
  image: Joi.string().optional(),
  description: Joi.string().optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
});

const updatePropertySchema = createPropertySchema.fork([], (schema) => schema.optional());

export const validateCreateProperty = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = createPropertySchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(", ");
    errorResponse(errorMessages, res);
    return;
  }
  
  next();
};

export const validateUpdateProperty = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updatePropertySchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(", ");
    errorResponse(errorMessages, res);
    return;
  }
  
  next();
};
