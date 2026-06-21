import rateLimit from "express-rate-limit";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";

/**
 * Rate limiting middleware to prevent abuse and DDoS attacks.
 *
 * The default in-memory store is sufficient for single-instance deployments.
 * Multi-instance deployments should use a shared store such as Redis.
 */

const MINUTE_MS = 60 * 1000;

const createLimiter = (max: number, windowMs: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
    statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
  });

// ============================ global ============================
export const limitRequests = createLimiter(
  300,
  15 * MINUTE_MS,
  "Too many requests — please try again later",
);

// ============================ auth ============================
export const limitGoogleRegisterRequests = createLimiter(
  5,
  60 * MINUTE_MS,
  "Too many Google registration attempts — please try again after 1 hour",
);

export const limitGoogleLoginRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "Too many Google login attempts — please try again after 15 minutes",
);

export const limitRefreshTokenRequests = createLimiter(
  30,
  15 * MINUTE_MS,
  "Too many token refresh attempts — please try again after 15 minutes",
);

export const limitLogoutRequests = createLimiter(
  30,
  15 * MINUTE_MS,
  "Too many logout attempts — please try again after 15 minutes",
);

export const limitRegisterRequests = createLimiter(
  5,
  60 * MINUTE_MS,
  "Too many registration attempts — please try again after 1 hour",
);

export const limitVerifyEmailRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "Too many email verification attempts — please try again after 15 minutes",
);

export const limitResendVerificationEmailRequests = createLimiter(
  3,
  15 * MINUTE_MS,
  "Too many verification email requests — please try again after 15 minutes",
);

export const limitLoginRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "Too many login attempts — please try again after 15 minutes",
);

export const limitForgotPasswordRequests = createLimiter(
  3,
  15 * MINUTE_MS,
  "Too many password reset requests — please try again after 15 minutes",
);

export const limitResetPasswordRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "Too many password reset attempts — please try again after 15 minutes",
);

export const limitChangePasswordRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "Too many password change attempts — please try again after 15 minutes",
);

// ============================ inquiry ============================
export const limitCreateInquiryRequests = createLimiter(
  10,
  60 * MINUTE_MS,
  "Too many inquiry submissions — please try again after 1 hour",
);
