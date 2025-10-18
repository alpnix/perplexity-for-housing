import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { errorResponse } from "../utils/api.response";
import { SignupType } from "../@types/custom";

export const validateRegisterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const registerUserSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
    }),
    password: Joi.string().when("signupType", {
      is: SignupType.EMAIL,
      then: Joi.string()
        .min(6)
        .pattern(/\d/)
        .pattern(/[!@#$%^&*()_,.?":{}|<>]/)
        .required()
        .messages({
          "string.min": "Password must be at least 6 characters long",
          "string.pattern.name":
            "Password must contain at least one number and one special character",
          "string.empty": "Password is required for email signup",
        }),
      otherwise: Joi.string().allow(null),
    }),
    signupType: Joi.string()
      .valid(...Object.values(SignupType))
      .required()
      .messages({
        "any.required": "SignupType is required",
        "any.only": "Invalid signup type",
      }),
    uid: Joi.string().when("signupType", {
      is: SignupType.GOOGLE,
      then: Joi.string().required().messages({
        "string.empty": "uid is required when doing google signup",
      }),
      otherwise: Joi.string().allow(null),
    }),
  });

  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    errorResponse(error.details[0].message, res);
    return;
  }
  next();
};

export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const loginUserSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
    }),
    password: Joi.string()
      .min(6)
      .pattern(/\d/)
      .pattern(/[!@#$%^&*()_,.?":{}|<>]/)
      .messages({
        "string.min": "Password must be at least 6 characters long",
        "string.pattern.name":
          "Password must contain at least one number and one special character",
        "string.empty": "Password is required for email signup",
      }),
    uid: Joi.string().allow(null),
  });

  const { error } = loginUserSchema.validate(req.body);
  if (error) {
    errorResponse(error.details[0].message, res);
    return;
  }
  next();
};

export const validateProfileUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const profileUpdateSchema = Joi.object({
    // defaultRole is ignored server-side; keep but disallow changes by not validating it
    defaultRole: Joi.forbidden(),
    city: Joi.object({
      description: Joi.string().required(),
      place_id: Joi.string().required(),
    }).allow(null),
    dob: Joi.string()
      .pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/)
      .allow(null)
      .messages({
        "string.pattern.base": "Date of birth must be in the format mm/dd/yyyy",
      }),
    gender: Joi.string().valid("Male", "Female", "Other").allow(null),
    openToRoommate: Joi.boolean().allow(null),
    drinks: Joi.boolean().allow(null),
    smokes: Joi.boolean().allow(null),
    budget: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required(),
    }).allow(null),
    interests: Joi.array().items(Joi.string()).allow(null),
    profileImage: Joi.string()
      .pattern(/^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/)
      .allow(null),
  });

  const { error } = profileUpdateSchema.validate(req.body);
  if (error) {
    errorResponse(error.details[0].message, res);
    return;
  }
  next();
};

export const validateImageUpload = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.files || !req.files.image) {
    errorResponse("Image file is required", res);
    return;
  }
  next();
};