import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { errorResponse } from "../utils/api.response";
import { RoommateStatus } from "../@types/custom";

const roommateStatusUpdateSchema = Joi.object({
  targetUserId: Joi.string().required().messages({
    "string.empty": "Target user ID is required",
    "any.required": "Target user ID is required"
  }),
  newStatus: Joi.string()
    .valid(...Object.values(RoommateStatus))
    .required()
    .messages({
      "string.empty": "New status is required",
      "any.required": "New status is required",
      "any.only": "Invalid status value"
    })
});

const openToRoommateUpdateSchema = Joi.object({
  openToRoommate: Joi.boolean().required().messages({
    "boolean.base": "openToRoommate must be a boolean value",
    "any.required": "openToRoommate is required"
  })
});

export const validateRoommateStatusUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = roommateStatusUpdateSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(", ");
    errorResponse(errorMessages, res);
    return;
  }
  
  next();
};

export const validateOpenToRoommateUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = openToRoommateUpdateSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(", ");
    errorResponse(errorMessages, res);
    return;
  }
  
  next();
};