import { Request, Response } from "express";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/api.response";
import { Property } from "../models/properties.model";
import { PropertyRequest } from "../models/propertyRequests.model";

export const createPropertyRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const { propertyId, roommate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      errorResponse("Property not found", res);
      return;
    }

    const status = roommate ? "draft" : "pending";

    const propertyRequest = new PropertyRequest({
      user: userId,
      property: propertyId,
      roommate: roommate || null,
      status,
    });

    await propertyRequest.save();

    successResponse("Property request created successfully", propertyRequest, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const approvePropertyRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const { requestId } = req.params;

    const propertyRequest = await PropertyRequest.findById(requestId);
    if (!propertyRequest) {
      errorResponse("Property request not found", res);
      return;
    }

    if (String(propertyRequest.roommate) !== userId) {
      errorResponse("Unauthorized action", res);
      return;
    }

    propertyRequest.status = "pending";
    await propertyRequest.save();

    successResponse("Property request approved successfully", propertyRequest, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const rejectPropertyRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const { requestId } = req.params;

    const propertyRequest = await PropertyRequest.findById(requestId);
    if (!propertyRequest) {
      errorResponse("Property request not found", res);
      return;
    }

    if (String(propertyRequest.roommate) !== userId) {
      errorResponse("Unauthorized action", res);
      return;
    }

    await PropertyRequest.findByIdAndDelete(requestId);

    successResponse("Property request rejected and deleted successfully", null, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};
