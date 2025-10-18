// roommate.controller.ts
import { Request, Response } from "express";
import { TenantProfile } from "../models/tenantProfile.model";
import { RoommateInterest, Match } from "../models";
import { UserDocument } from "../@types/custom";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/api.response";
import mongoose from "mongoose";

type RoommateStatus = "pending" | "accepted" | "not-interested";

const createRoommateInterest = async (
  initiatorId: string,
  recipientId: string,
  status: "connection" | "not-interested"
) => {
  try {
    const interest = await RoommateInterest.create({
      initiator: new mongoose.Types.ObjectId(initiatorId),
      recipient: new mongoose.Types.ObjectId(recipientId),
      status,
    });
    return interest;
  } catch (err) {
    console.error("Failed to create RoommateInterest:", err);
    return null;
  }
};

// Ensure a single RoommateInterest exists between two users with the latest status
const upsertRoommateInterest = async (
  initiatorId: string,
  recipientId: string,
  status: "connection" | "not-interested"
) => {
  try {
    // Directional upsert: only match current initiator -> recipient
    const filter = {
      initiator: new mongoose.Types.ObjectId(initiatorId),
      recipient: new mongoose.Types.ObjectId(recipientId),
    } as const;
    const update = {
      initiator: new mongoose.Types.ObjectId(initiatorId),
      recipient: new mongoose.Types.ObjectId(recipientId),
      status,
    };
    const interest = await RoommateInterest.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });
    return interest;
  } catch (err) {
    console.error("Failed to upsert RoommateInterest:", err);
    return null;
  }
};

// Remove any RoommateInterest records between two users in either direction
const deleteRoommateInterestPair = async (
  userAId: string,
  userBId: string
) => {
  try {
    const ids = [
      new mongoose.Types.ObjectId(userAId),
      new mongoose.Types.ObjectId(userBId),
    ];
    await RoommateInterest.deleteMany({
      initiator: { $in: ids },
      recipient: { $in: ids },
    });
  } catch (err) {
    console.error("Failed to delete RoommateInterest pair:", err);
  }
};

export const getRecommendedRoommates = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const currentProfile = await TenantProfile.findOne({
      user: userId,
    }).populate<{ user: UserDocument }>("user", "firstname lastname email image");
    if (!currentProfile) {
      errorResponse("Please create your tenant profile first", res);
      return;
    }

    // Exclude only users that the current user has initiated interest towards
    const interests = await RoommateInterest.find({
      initiator: new mongoose.Types.ObjectId(userId),
    }).select("recipient");

    const excludedObjectIds: mongoose.Types.ObjectId[] = [];
    for (const interest of interests) {
      const recipientId = (interest as any).recipient?.toString?.();
      if (recipientId) {
        excludedObjectIds.push(new mongoose.Types.ObjectId(recipientId));
      }
    }

    const roommates = await TenantProfile.find({
      user: {
        $ne: new mongoose.Types.ObjectId(userId),
        ...(excludedObjectIds.length > 0 ? { $nin: excludedObjectIds } : {}),
      },
      openToRoommate: true,
    }).populate<{ user: UserDocument | null }>("user", "firstname lastname email image");

    const filteredRoommates = roommates
      .map(roommate => {
        if (!roommate.user) {
          console.error(`TenantProfile ${roommate._id} has no valid user reference`);
          return null;
        }
        const rawUserImage = (roommate.user as any).image as string | undefined;
        const safeImage = (roommate as any).profileImage
          ? (roommate as any).profileImage
          : rawUserImage && (rawUserImage.startsWith("http") || rawUserImage.startsWith("data:"))
          ? rawUserImage
          : undefined;
        return {
          user: {
            _id: (roommate.user as any)._id,
            firstname: (roommate.user as any).firstname,
            lastname: (roommate.user as any).lastname,
            email: (roommate.user as any).email,
            image: safeImage,
          },
          tenantProfile: {
            city: (roommate as any).city,
            gender: (roommate as any).gender || "Unknown",
            interests: (roommate as any).interests || [],
            budget: (roommate as any).budget,
            drinks: (roommate as any).drinks,
            smokes: (roommate as any).smokes,
          },
        };
      })
      .filter((roommate): roommate is NonNullable<typeof roommate> => roommate !== null);

    successResponse("Recommended roommates retrieved successfully", filteredRoommates, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const updateRoommateStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { targetUserId, newStatus } = req.body as { targetUserId: string; newStatus: RoommateStatus };

    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const profile = await TenantProfile.findOne({ user: userId });
    if (!profile) {
      errorResponse("Tenant profile not found", res);
      return;
    }

    if (newStatus === "pending") {
      await upsertRoommateInterest(userId, targetUserId, "connection");

      const reciprocal = await RoommateInterest.findOne({
        initiator: new mongoose.Types.ObjectId(targetUserId),
        recipient: new mongoose.Types.ObjectId(userId),
        status: "connection",
      });

      if (reciprocal) {
        const a = new mongoose.Types.ObjectId(userId).toString();
        const b = new mongoose.Types.ObjectId(targetUserId).toString();
        const [first, second] = a < b ? [a, b] : [b, a];
        const uniqueId = `${first}_${second}`;
        const existingMatch = await Match.findOne({ uniqueId });
        if (!existingMatch) {
          await Match.create({
            user1: new mongoose.Types.ObjectId(first),
            user2: new mongoose.Types.ObjectId(second),
            uniqueId,
          });
        }
      }
    } else if (newStatus === "not-interested") {
      await upsertRoommateInterest(userId, targetUserId, "not-interested");
    } else if (newStatus === "accepted") {
      await deleteRoommateInterestPair(userId, targetUserId);
    } else if (newStatus === "recommended") {
      await deleteRoommateInterestPair(userId, targetUserId);
    }

    successResponse("Roommate status updated successfully", { userId, targetUserId, newStatus }, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const getRoommateInterests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const interests = await RoommateInterest.find({
      $or: [
        { initiator: new mongoose.Types.ObjectId(userId) },
        { recipient: new mongoose.Types.ObjectId(userId) },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("initiator", "firstname lastname email image")
      .populate("recipient", "firstname lastname email image");

    successResponse("Roommate interests retrieved successfully", interests, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const getRoommatesByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const status = req.params.status as RoommateStatus;

    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    let interestQuery: any = null;
    if (status === "pending") {
      interestQuery = {
        status: "connection",
        initiator: new mongoose.Types.ObjectId(userId),
      };
    } else if (status === "not-interested") {
      interestQuery = {
        status: "not-interested",
        initiator: new mongoose.Types.ObjectId(userId),
      };
    } else if (status === "accepted") {
      const matches = await Match.find({
        $or: [
          { user1: new mongoose.Types.ObjectId(userId) },
          { user2: new mongoose.Types.ObjectId(userId) },
        ],
      }).sort({ createdAt: -1 });

      const roommates = await Promise.all(
        matches.map(async (match) => {
          const m: any = match as any;
          const otherUserId = m.user1?.toString() === userId ? m.user2?.toString() : m.user1?.toString();
          if (!otherUserId) return null;
          const otherProfile = await TenantProfile.findOne({
            user: otherUserId,
            openToRoommate: true,
          }).populate<{ user: UserDocument }>("user", "firstname lastname email image");
          if (!otherProfile || !otherProfile.user) return null;
          const rawUserImage = (otherProfile.user as any).image as string | undefined;
          const safeImage = (otherProfile as any).profileImage
            ? (otherProfile as any).profileImage
            : rawUserImage && (rawUserImage.startsWith("http") || rawUserImage.startsWith("data:"))
            ? rawUserImage
            : undefined;
          return {
            user: {
              _id: (otherProfile.user as any)._id,
              firstname: (otherProfile.user as any).firstname,
              lastname: (otherProfile.user as any).lastname,
              email: (otherProfile.user as any).email,
              image: safeImage,
            },
            tenantProfile: {
              city: (otherProfile as any).city,
              gender: (otherProfile as any).gender || "Unknown",
              interests: (otherProfile as any).interests || [],
              budget: (otherProfile as any).budget,
              drinks: (otherProfile as any).drinks,
              smokes: (otherProfile as any).smokes,
              profileImage: (otherProfile as any).profileImage,
            },
            connectionStatus: "accepted",
            requestInitiator: null,
          };
        })
      );

      const sanitized = roommates.filter((r) => r !== null);
      successResponse(`Roommates with status ${status} retrieved successfully`, sanitized, res);
      return;
    } else {
      successResponse(`Roommates with status ${status} retrieved successfully`, [], res);
      return;
    }

    const interests = await RoommateInterest.find(interestQuery).sort({ createdAt: -1 });
    const roommates = await Promise.all(
      interests.map(async (interest) => {
        const interestObj: any = interest as any;
        const otherUserId =
          interestObj.initiator?.toString() === userId
            ? interestObj.recipient?.toString()
            : interestObj.initiator?.toString();
        if (!otherUserId) {
          return null;
        }
        const a = new mongoose.Types.ObjectId(userId).toString();
        const b = new mongoose.Types.ObjectId(otherUserId).toString();
        const [first, second] = a < b ? [a, b] : [b, a];
        const uniqueId = `${first}_${second}`;
        const existingMatch = await Match.findOne({ uniqueId });
        if (existingMatch && status === "pending") {
          return null;
        }
        const otherProfile = await TenantProfile.findOne({
          user: otherUserId,
          openToRoommate: true,
        }).populate<{ user: UserDocument }>("user", "firstname lastname email image");
        if (!otherProfile || !otherProfile.user) {
          return null;
        }
        const rawUserImage = (otherProfile.user as any).image as string | undefined;
        const safeImage = (otherProfile as any).profileImage
          ? (otherProfile as any).profileImage
          : rawUserImage && (rawUserImage.startsWith("http") || rawUserImage.startsWith("data:"))
          ? rawUserImage
          : undefined;
        return {
          user: {
            _id: (otherProfile.user as any)._id,
            firstname: (otherProfile.user as any).firstname,
            lastname: (otherProfile.user as any).lastname,
            email: (otherProfile.user as any).email,
            image: safeImage,
          },
          tenantProfile: {
            city: (otherProfile as any).city,
            gender: (otherProfile as any).gender || "Unknown",
            interests: (otherProfile as any).interests || [],
            budget: (otherProfile as any).budget,
            drinks: (otherProfile as any).drinks,
            smokes: (otherProfile as any).smokes,
          },
          connectionStatus: interestObj.status === "connection" ? "pending" : "not-interested",
          requestInitiator: interestObj.initiator?.toString() || null,
        };
      })
    );

    const sanitized = roommates.filter((r) => r !== null);

    successResponse(`Roommates with status ${status} retrieved successfully`, sanitized, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const updateOpenToRoommateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { openToRoommate } = req.body as { openToRoommate: boolean };

    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    if (typeof openToRoommate !== "boolean") {
      errorResponse("openToRoommate must be a boolean value", res);
      return;
    }

    const profile = await TenantProfile.findOneAndUpdate(
      { user: userId },
      { openToRoommate },
      { new: true }
    );

    if (!profile) {
      errorResponse("Tenant profile not found", res);
      return;
    }

    successResponse("Open to roommate status updated successfully", { openToRoommate }, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const deleteRoommateInterestForPair = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { targetUserId } = req.params as { targetUserId: string };

    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    if (!targetUserId) {
      errorResponse("Target user id is required", res);
      return;
    }

    await deleteRoommateInterestPair(userId, targetUserId);

    successResponse("Roommate interest pair deleted successfully", { userId, targetUserId }, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};
