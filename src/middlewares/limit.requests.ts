import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { getResponseLocale, t } from "../shared/i18n/i18n.js";
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
    message: (_req: Request, res: Response) => ({
      success: false,
      message: t(getResponseLocale(res), message),
    }),
    statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
  });

// ============================ global ============================
export const limitRequests = createLimiter(
  300,
  15 * MINUTE_MS,
  "rateLimit.global",
);

// ============================ auth ============================
export const limitGoogleRegisterRequests = createLimiter(
  5,
  60 * MINUTE_MS,
  "rateLimit.googleRegister",
);

export const limitGoogleLoginRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "rateLimit.googleLogin",
);

export const limitRefreshTokenRequests = createLimiter(
  30,
  15 * MINUTE_MS,
  "rateLimit.refreshToken",
);

export const limitLogoutRequests = createLimiter(
  30,
  15 * MINUTE_MS,
  "rateLimit.logout",
);

export const limitRegisterRequests = createLimiter(
  5,
  60 * MINUTE_MS,
  "rateLimit.register",
);

export const limitVerifyEmailRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "rateLimit.verifyEmail",
);

export const limitResendVerificationEmailRequests = createLimiter(
  3,
  15 * MINUTE_MS,
  "rateLimit.resendVerificationEmail",
);

export const limitLoginRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "rateLimit.login",
);

export const limitForgotPasswordRequests = createLimiter(
  3,
  15 * MINUTE_MS,
  "rateLimit.forgotPassword",
);

export const limitResetPasswordRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "rateLimit.resetPassword",
);

export const limitChangePasswordRequests = createLimiter(
  5,
  15 * MINUTE_MS,
  "rateLimit.changePassword",
);

// ============================ inquiry ============================
export const limitCreateInquiryRequests = createLimiter(
  10,
  60 * MINUTE_MS,
  "rateLimit.createInquiry",
);
