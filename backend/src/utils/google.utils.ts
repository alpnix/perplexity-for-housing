import { config } from "dotenv";
import { OAuth2Client } from "google-auth-library";
import { GoogleUserInfo } from "../@types/custom";
config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyUid = async (uid: string): Promise<GoogleUserInfo> => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: uid,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid token payload");
    }

    const { email, name, exp } = payload;

    if (Date.now() / 1000 > exp) {
      throw new Error("Token has expired");
    }

    return {
      email,
      name,
    };
  } catch (error) {
    throw new Error("Google UID verification failed");
  }
};
