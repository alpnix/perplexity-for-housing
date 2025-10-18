import { Request, Response } from "express";
import { User } from "../models";
import { verifyUid } from "../utils/google.utils";
import {
  errorResponse,
  serverErrorResponse,
  successResponse,
} from "../utils/api.response";
import { signToken } from "../utils/jwt.utils";
import { compare, genSalt, hash } from "bcrypt";
import {
  LoginInput,
  Role,
  SignupType,
  UserInput,
  UserProfileUpdateInput,
} from "../@types/custom";
import { TenantProfile } from "../models/tenantProfile.model";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const makePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body); 

    if (!process.env.STRIPE_SECRET_KEY) {
      errorResponse("Stripe secret key is not set", res);
      return;
    }

    const { amount } = await req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    successResponse("Payment successful", {
      client_secret: paymentIntent.client_secret,
    }, res);
    return;
  } 
  catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {

    // Fetch all the users in the database
    const users = await User.find({});
    successResponse("Users fetched successfully", users, res);
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
}


const validateGoogleUser = async (
  uid: string,
  email: string
): Promise<void> => {
  try {
    const result = await verifyUid(uid);
    if (!result || result.email !== email) {
      throw new Error("Google UID verification failed. Email does not match.");
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

const handleGoogleLogin = async (
  userData: UserInput | LoginInput,
  existingUser: InstanceType<typeof User>,
  res: Response
): Promise<void> => {
  await validateGoogleUser(userData.uid || "", userData.email);
  const token = signToken(
    { id: existingUser._id, new: existingUser.isNewUser },
    res
  );
  successResponse(
    "User by email already exists, third-party login successful",
    { token, role: existingUser.defaultRole },
    res
  );
  return;
};

const handleEmailLogin = async (
  userData: UserInput | LoginInput,
  existingUser: InstanceType<typeof User>,
  res: Response
): Promise<void> => {
  if (!userData.password) {
    errorResponse("Password is required for email login.", res);
    return;
  }
  const isPasswordMatch = await compare(
    userData.password,
    existingUser.password || ""
  );
  if (!isPasswordMatch) {
    errorResponse("Invalid password. Please try again.", res);
    return;
  }
  const token = signToken(
    { id: existingUser._id, new: existingUser.isNewUser },
    res
  );
  successResponse(
    "User by email already exists, logged in successfully",
    { token, role: existingUser.defaultRole },
    res
  );
  return;
};

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userData: UserInput = req.body;

    const findByEmail = await User.findOne({ email: userData.email });

    if (findByEmail) {
      if (userData.signupType === SignupType.GOOGLE) {
        await handleGoogleLogin(userData, findByEmail, res);
        return;
      }
      await handleEmailLogin(userData, findByEmail, res);
      return;
    }

    if (userData.signupType === SignupType.EMAIL) {
      if (!userData.password) {
        errorResponse("Password is required for email sign-up.", res);
        return;
      }
      const salt = await genSalt(10);
      userData.password = await hash(userData.password, salt);
    } else {
      await validateGoogleUser(userData.uid || "", userData.email);
      delete userData.password;
    }

    // Force tenant-only platform: default all users to TENANT
    const newUser = new User({ ...userData, defaultRole: Role.TENANT });
    await newUser.save();

    const token = signToken({ id: newUser._id, new: newUser.isNewUser }, res);

    successResponse(
      "User registered successfully",
      { token, role: newUser.defaultRole },
      res
    );
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    let userData: LoginInput = req.body;
    const findByEmail = await User.findOne(
      { email: userData.email },
      "+password"
    );
    if (!findByEmail) {
      errorResponse("User not found", res);
      return;
    }
    if (userData.uid) {
      if (findByEmail.signupType === SignupType.EMAIL) {
        errorResponse("Email login required", res);
        return;
      }
      await handleGoogleLogin(userData, findByEmail, res);
      return;
    }
    await handleEmailLogin(userData, findByEmail, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    if (!id) {
      errorResponse("User not authenticated", res);
      return;
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      errorResponse("User not found", res);
      return;
    }

    let tenantProfile = null;
    if (user.defaultRole === Role.TENANT) {
      tenantProfile = await TenantProfile.findOne({ user: id })
        .populate("user", "firstname lastname email image");
    }

    const safeUserImage = (() => {
      const fromProfile = tenantProfile?.profileImage;
      if (fromProfile && typeof fromProfile === "string") return fromProfile;
      const img = user.image || "";
      if (typeof img === "string" && (img.startsWith("http") || img.startsWith("data:"))) {
        return img;
      }
      return undefined;
    })();

    const profileData = {
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        defaultRole: user.defaultRole,
        signupType: user.signupType,
        isNewUser: user.isNewUser,
        image: safeUserImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tenantProfile: tenantProfile
        ? {
            ...tenantProfile.toObject(),
            gender: tenantProfile.gender || "Unknown",
          }
        : null,
    };

    successResponse("User profile retrieved successfully", profileData, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    if (!id) {
      errorResponse("User not authenticated", res);
      return;
    }

    const userData: UserProfileUpdateInput = req.body;
    // Sanitize incoming profile data to prevent invalid assignments
    const sanitizedData: Partial<UserProfileUpdateInput> = {};
    if (
      userData.city &&
      typeof userData.city.description === "string" &&
      userData.city.description.trim() !== "" &&
      typeof userData.city.place_id === "string" &&
      userData.city.place_id.trim() !== ""
    ) {
      sanitizedData.city = userData.city;
    }
    if (typeof userData.dob === "string" && userData.dob.trim() !== "") {
      sanitizedData.dob = userData.dob;
    }
    if (
      typeof userData.gender === "string" &&
      ["Male", "Female", "Other"].includes(userData.gender)
    ) {
      sanitizedData.gender = userData.gender as any;
    }
    if (typeof userData.openToRoommate === "boolean") {
      sanitizedData.openToRoommate = userData.openToRoommate;
    }
    if (Array.isArray(userData.interests)) {
      sanitizedData.interests = userData.interests.filter(
        (i) => typeof i === "string"
      );
    }
    if (typeof userData.drinks === "boolean") {
      sanitizedData.drinks = userData.drinks;
    }
    if (typeof userData.smokes === "boolean") {
      sanitizedData.smokes = userData.smokes;
    }
    if (
      userData.budget &&
      typeof (userData.budget as any).min === "number" &&
      typeof (userData.budget as any).max === "number"
    ) {
      sanitizedData.budget = userData.budget;
    }
    if (typeof userData.profileImage === "string") {
      sanitizedData.profileImage = userData.profileImage;
    }
    const user = await User.findOne({ _id: id });
    if (!user) {
      errorResponse("User not found", res);
      return;
    }

    // Enforce tenant-only: ignore incoming defaultRole changes, lock to TENANT
    user.defaultRole = Role.TENANT;

    const fieldsToUpdate: (keyof UserProfileUpdateInput)[] = [
      "city",
      "dob",
      "gender",
      "openToRoommate",
      "interests",
      "drinks",
      "smokes",
      "budget",
      "profileImage",
    ];

    if (user.defaultRole === Role.TENANT) {
      let profile =
        (await TenantProfile.findOne({ user: id })) ||
        new TenantProfile({ user: id });

      fieldsToUpdate.forEach((field) => {
        if (sanitizedData[field as keyof UserProfileUpdateInput] !== undefined) {
          (profile as any)[field] = sanitizedData[field as keyof UserProfileUpdateInput];
        }
      });

      user.isNewUser = fieldsToUpdate.every(
        (field) => sanitizedData[field as keyof UserProfileUpdateInput] !== undefined
      );
      await user.save();

      await profile.save();
    }

    successResponse("User profile updated successfully", null, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

export const uploadProfileImage = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?.id;
    if (!id) {
      errorResponse("User not authenticated", res);
      return;
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      errorResponse("User not found", res);
      return;
    }

    if (!req.file) {
      errorResponse("No image file provided", res);
      return;
    }

    user.image = req.file.path;
    await user.save();

    successResponse(
      "Profile image uploaded successfully",
      { image: user.image },
      res
    );
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};

// Get another user's public tenant profile by user id
export const getProfileById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    if (!id) {
      errorResponse("User id is required", res);
      return;
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      errorResponse("User not found", res);
      return;
    }

    let tenantProfile = await TenantProfile.findOne({ user: id }).populate(
      "user",
      "firstname lastname email image"
    );

    const safeUserImage = (() => {
      const fromProfile = (tenantProfile as any)?.profileImage;
      if (fromProfile && typeof fromProfile === "string") return fromProfile;
      const img = (user as any).image || "";
      if (typeof img === "string" && (img.startsWith("http") || img.startsWith("data:"))) {
        return img;
      }
      return undefined;
    })();

    const data = {
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        image: safeUserImage,
      },
      tenantProfile: tenantProfile
        ? {
            city: (tenantProfile as any).city,
            gender: (tenantProfile as any).gender || "Unknown",
            interests: (tenantProfile as any).interests || [],
            budget: (tenantProfile as any).budget,
            drinks: (tenantProfile as any).drinks,
            smokes: (tenantProfile as any).smokes,
            profileImage: (tenantProfile as any).profileImage,
            dob: (tenantProfile as any).dob,
            openToRoommate: (tenantProfile as any).openToRoommate,
          }
        : null,
    };

    successResponse("Public profile retrieved successfully", data as any, res);
    return;
  } catch (error) {
    serverErrorResponse(error, res, req);
    return;
  }
};
