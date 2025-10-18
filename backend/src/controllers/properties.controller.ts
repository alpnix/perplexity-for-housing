import { Request, Response } from "express";
import { House, HouseInterest } from "../models";
import { TenantProfile } from "../models/tenantProfile.model";
import type { HouseDoc } from "../models/house.model";
import { Types } from "mongoose";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/api.response";

export const listProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      type,
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      status,
    } = req.query as Record<string, string | undefined>;

    const query: any = {};

    if (search) {
      // Normalize search term: lowercase, trim spaces
      const normalizedSearch = search.toLowerCase().trim();
      if (normalizedSearch) {
        query.$or = [
          { Address: { $regex: normalizedSearch, $options: "i" } },
          { Title: { $regex: normalizedSearch, $options: "i" } },
          { Description: { $regex: normalizedSearch, $options: "i" } },
          { DetailsURL: { $regex: normalizedSearch, $options: "i" } },
        ];
      }
    }

    if (type && type !== "all") {
      query.RealEstate = { $regex: type, $options: "i" };
    }

    if (minPrice) query.Price = { ...(query.Price || {}), $gte: Number(minPrice) };
    if (maxPrice) query.Price = { ...(query.Price || {}), $lte: Number(maxPrice) };
    if (minBeds) query.Bedrooms = { $gte: Number(minBeds) };
    if (minBaths) query.Bathrooms = { $gte: Number(minBaths) };

    // Handle interest-based filtering
    const userId = req.user?.id;
    const normalizedStatus = (status || "").toString();

    if (userId && ["recommended", "interested", "not-interested"].includes(normalizedStatus)) {
      if (normalizedStatus === "recommended") {
        // Exclude houses the user has already interacted with
        const interests = await HouseInterest.find({ user: userId }).select("house").lean();
        const houseIds = interests.map((i: any) => i.house);
        if (houseIds.length > 0) {
          query._id = { ...(query._id || {}), $nin: houseIds };
        }

        // Fetch tenant profile for preferences
        const profile = await TenantProfile.findOne({ user: userId }).lean();

        // If user is not open to roommates, recommend only 1-bedroom properties
        if (profile?.openToRoommate === false) {
          query.Bedrooms = 1;
        }
        const LIMIT = 100;
        const housesRecommended = (await House.find(query).limit(LIMIT).lean()) as unknown as HouseDoc[];
        const data = housesRecommended.map((h) => {
          const img = (h as any).ImageURL;
          const imageArray: string[] = Array.isArray(img)
            ? (img as any[]).map((x) => String(x)).filter(Boolean)
            : typeof img === "string" && img
            ? [img]
            : ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8"];

          return {
            _id: String((h as any)._id),
            name: (h as any).Title || "Property",
            image: imageArray,
            price: (h as any).Price || 0,
            bedrooms: (h as any).Bedrooms || 0,
            bathrooms: (h as any).Bathrooms || 0,
            sqft: (h as any).Area || null,
            type: (h as any).RealEstate || "Unknown",
            link: (h as any).DetailsURL || "",
            propertyLocation: {
              place_id: "",
              address: (h as any).Address || "",
              coordinates: {
                lat: (h as any).LATITUDE || 0,
                lng: (h as any).LONGITUDE || 0,
              },
            },
            description: (h as any).Description?.trim?.() || "",
            amenities: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        });
        successResponse("Properties fetched successfully", data as any, res);
        return;
      } else {
        const interests = await HouseInterest.find({ user: userId, status: normalizedStatus as any })
          .select("house")
          .lean();
        const houseIds = interests.map((i: any) => i.house);
        // If there are no matching interests, short-circuit to empty result
        if (houseIds.length === 0) {
          successResponse("Properties fetched successfully", [] as any, res);
          return;
        }
        query._id = { ...(query._id || {}), $in: houseIds };
      }
    }

    const houses = (await House.find(query).limit(100).lean()) as unknown as HouseDoc[];

    // Map to frontend Property shape minimally
    const data = houses.map((h) => {
      const img = (h as any).ImageURL;
      const imageArray: string[] = Array.isArray(img)
        ? (img as any[]).map((x) => String(x)).filter(Boolean)
        : typeof img === "string" && img
        ? [img]
        : ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8"];

      return {
        _id: String(h._id),
        name: h.Title || "Property",
        image: imageArray,
        price: (h as any).Price || 0,
        bedrooms: (h as any).Bedrooms || 0,
        bathrooms: (h as any).Bathrooms || 0,
        sqft: (h as any).Area || null,
        type: (h as any).RealEstate || "Unknown",
        link: (h as any).DetailsURL || "",
        propertyLocation: {
          place_id: "",
          address: (h as any).Address || "",
          coordinates: {
            lat: (h as any).LATITUDE || 0,
            lng: (h as any).LONGITUDE || 0,
          },
        },
        description: h.Description?.trim() || "",
        amenities: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });


    successResponse("Properties fetched successfully", data as any, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const listRealEstateAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const distinctAgents = await (House as any).distinct("RealEstate");
    const agents: string[] = (Array.isArray(distinctAgents) ? distinctAgents : [])
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => !!v)
      .sort((a, b) => a.localeCompare(b));
    successResponse("Real estate agents fetched successfully", agents as any, res);

    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;


    let h: any = null;
    if (Types.ObjectId.isValid(id)) {
      h = (await House.findById(id).lean()) as unknown as HouseDoc | null;
    } else {
      // Fall back to raw driver lookup with string _id to avoid Mongoose ObjectId casting
      h = (await (House.collection as any).findOne({ _id: id })) as any;
    }

    if (!h) {
      errorResponse("Property not found", res);
      return;
    }

    const img = (h as any).ImageURL;
    const imageArray: string[] = Array.isArray(img)
      ? (img as any[]).map((x) => String(x)).filter(Boolean)
      : typeof img === "string" && img
      ? [img]
      : ["https://images.unsplash.com/photo-1560185893-a55cbc8c57e8"];

    const data = {
      _id: String(h._id),
      name: h.Title || "Property",
      image: imageArray,
      price: (h as any).Price || 0,
      bedrooms: (h as any).Bedrooms || 0,
      bathrooms: (h as any).Bathrooms || 0,
      sqft: (h as any).Area || null,
      type: (h as any).RealEstate || "Unknown",
      link: (h as any).DetailsURL || "",
      propertyLocation: {
        place_id: "",
        address: (h as any).Address || "",
        coordinates: {
          lat: (h as any).LATITUDE || 0,
          lng: (h as any).LONGITUDE || 0,
        },
      },
      description:  h.Description?.trim() || "",
      amenities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    successResponse("Property fetched successfully", data as any, res);
    return;
  } catch (error: any) {
    // Gracefully handle invalid ObjectId errors
    if (
      typeof error?.message === "string" &&
      error.message.includes("Cast to ObjectId failed")
    ) {
      errorResponse("Invalid property id", res);
      return;
    }
    serverErrorResponse(error, res, req);
    return;
  }
};

export const setHouseInterest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      errorResponse("User not authenticated", res);
      return;
    }

    const { id } = req.params; // house id
    const { status } = req.body as { status?: string };

    if (!id) {
      errorResponse("House id is required", res);
      return;
    }

    if (!status || !["interested", "not-interested"].includes(status)) {
      errorResponse("Invalid status. Must be 'interested' or 'not-interested'", res);
      return;
    }

    // Upsert interest record for this user-house pair
    const updated = await HouseInterest.findOneAndUpdate(
      { user: userId, house: id },
      { status },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    successResponse("Interest updated successfully", updated as any, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

