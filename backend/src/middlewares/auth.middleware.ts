import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorResponse, unauthorizedResponse } from "../utils/api.response";
import { verifyToken } from "../utils/jwt.utils";

declare module "jsonwebtoken" {
  export interface UserJwtPayload extends jwt.JwtPayload {
    id: any;
    role: string;
  }
}

export default function (req: Request, res: Response, next: NextFunction) {
  let token: string | undefined = req
    .header("Authorization")
    ?.trim()
    ?.replace("Bearer ", "");

  if (!token) {
    token = req.cookies?.token;
  }

  if (!token) {
    unauthorizedResponse("Access Denied! You need to login first", res);
    return;
  }

  try {
    const decoded = <jwt.UserJwtPayload>verifyToken(token);
    req.user = decoded;
    next();
  } catch (ex) {
    unauthorizedResponse("Invalid token", res);
    return;
  }
}
