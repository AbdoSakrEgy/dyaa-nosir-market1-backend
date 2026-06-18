import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../../shared/utils/error/app.error.js";

const googleClient = new OAuth2Client(env.GOOGLE_WEB_CLIENT_ID);

export async function verifyGoogleToken(googleToken: string) {
  if (!env.GOOGLE_WEB_CLIENT_ID) {
    throw new BadRequestError("Google login is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: env.GOOGLE_WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new UnauthorizedError("Invalid Google token");
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? payload.email.split("@")[0] ?? "Google User",
    picture: payload.picture,
  };
}
