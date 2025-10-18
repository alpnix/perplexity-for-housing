import { Request, Response } from "express";
import mongoose from "mongoose";
import { Message, Match } from "../models";
import { TenantProfile } from "../models/tenantProfile.model";
import { errorResponse, serverErrorResponse, successResponse } from "../utils/api.response";

// GET /chats/matches
const listMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const matches = await Match.find({
      $or: [
        { user1: new mongoose.Types.ObjectId(currentUserId) },
        { user2: new mongoose.Types.ObjectId(currentUserId) },
      ],
    }).sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      matches.map(async (match) => {
        const isUser1 = (match as any).user1?.toString() === currentUserId;
        const otherUserId = isUser1 ? (match as any).user2?.toString() : (match as any).user1?.toString();
        if (!otherUserId) return null;
        const otherProfile = await TenantProfile.findOne({ user: otherUserId })
          .populate("user", "firstname lastname email image");
        return {
          matchId: match._id,
          otherUser: otherProfile?.user || null,
          tenantProfile: otherProfile ? {
            city: otherProfile.city,
            gender: otherProfile.gender || "Unknown",
            interests: otherProfile.interests || [],
            budget: otherProfile.budget,
            drinks: otherProfile.drinks,
            smokes: otherProfile.smokes,
            profileImage: (otherProfile as any).profileImage,
          } : null,
        };
      })
    );

    const data = enriched.filter((e) => e !== null);
    successResponse("Matches retrieved successfully", data as any, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

// GET /chats/matches/:matchId/messages
const getMessagesForMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const { matchId } = req.params as { matchId: string };
    if (!currentUserId) {
      errorResponse("User not authenticated", res);
      return;
    }
    if (!matchId) {
      errorResponse("matchId is required", res);
      return;
    }

    const match = await Match.findById(matchId);
    if (!match) {
      errorResponse("Match not found", res);
      return;
    }
    const isParticipant = [
      (match as any).user1?.toString(),
      (match as any).user2?.toString(),
    ].includes(currentUserId);
    if (!isParticipant) {
      errorResponse("Forbidden: not a participant of this match", res);
      return;
    }

    const messages = await Message.find({ match: new mongoose.Types.ObjectId(matchId) })
      .sort({ createdAt: 1 });

    successResponse("Messages fetched successfully", messages, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

// POST /chats/matches/:matchId/messages
const sendMessageToMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    const { matchId } = req.params as { matchId: string };
    const { content } = req.body as { content?: string };
    if (!currentUserId) {
      errorResponse("User not authenticated", res);
      return;
    }
    if (!matchId || !content) {
      errorResponse("matchId and content are required", res);
      return;
    }

    const match = await Match.findById(matchId);
    if (!match) {
      errorResponse("Match not found", res);
      return;
    }
    const isParticipant = [
      (match as any).user1?.toString(),
      (match as any).user2?.toString(),
    ].includes(currentUserId);
    if (!isParticipant) {
      errorResponse("Forbidden: not a participant of this match", res);
      return;
    }

    const newMessage = new Message({
      sender: new mongoose.Types.ObjectId(currentUserId),
      match: new mongoose.Types.ObjectId(matchId),
      content,
      isRead: false,
    });
    await newMessage.save();

    successResponse("Message sent successfully", newMessage, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export { listMatches, getMessagesForMatch, sendMessageToMatch };