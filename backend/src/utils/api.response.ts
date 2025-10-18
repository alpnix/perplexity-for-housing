import { Response } from "express";
import { ApiResponse } from "../@types/global";

export const errorResponse = (
  message: string,
  res: Response,
): Response<ApiResponse<null>> => {
  const response: ApiResponse<null> = {
    status: 400,
    message,
    data: null,
  };

  return res.status(400).json(response);
};

export const unauthorizedResponse = (
  message: string,
  res: Response,
): Response<ApiResponse<null>> => {
  const response: ApiResponse<null> = {
    status: 400,
    message,
    data: null,
  };

  return res.status(401).json(response);
};

export const successResponse = <T>(
  message: string,
  body: T | null,
  res: Response,
): Response<ApiResponse<T>> => {
  const response: ApiResponse<T> = {
    status: 200,
    message,
    data: body || undefined,
  };

  return res.status(200).json(response);
};

export const notFoundResponse = (
  message: string,
  res: Response,
): Response<ApiResponse<null>> => {
  const response: ApiResponse<null> = {
    status: 404,
    message,
    data: null,
  };

  return res.status(404).json(response);
};

export const serverErrorResponse = (
  ex: any,
  res: Response,
  req: any,
): Response<ApiResponse<null>> => {
  console.error(`Error occurred on ${req.method} ${req.originalUrl}:`, ex);

  const response: ApiResponse<null> = {
    status: 500,
    message: "Server Error",
    data: null,
  };

  return res.status(500).json(response);
};
