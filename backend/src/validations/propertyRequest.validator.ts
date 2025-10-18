import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { errorResponse } from "../utils/api.response";

const propertyRequestSchema = Joi.object({
  propertyId: Joi.string().required().messages({
    "string.empty": "Property ID is required",
    "any.required": "Property ID is required",
  }),
  roommate: Joi.string().optional(),
});

const propertyRequestActionSchema = Joi.object({
  requestId: Joi.string().required().messages({
    "string.empty": "Request ID is required",
    "any.required": "Request ID is required",
  }),
});

export const validatePropertyRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = propertyRequestSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(", ");
    errorResponse(errorMessages, res);
    return;
  }

  next();
};

export const validatePropertyRequestAction = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = propertyRequestActionSchema.validate(req.params, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(", ");
    errorResponse(errorMessages, res);
    return;
  }

  next();
};
