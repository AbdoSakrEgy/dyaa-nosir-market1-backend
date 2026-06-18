import { Router } from "express";
import { authController } from "./auth.controller.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import { validate } from "../../middlewares/validate.js";
import { limitAuthRequests } from "../../middlewares/limit.auth.requests.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  emailSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validators.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post(
  "/register",
  limitAuthRequests,
  validate({ body: registerSchema }),
  asyncHandler(authController.register.bind(authController)),
);

router.post(
  "/login",
  limitAuthRequests,
  validate({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController)),
);

router.post(
  "/refresh-token",
  limitAuthRequests,
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshToken.bind(authController)),
);

router.post(
  "/logout",
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.logout.bind(authController)),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.me.bind(authController)),
);

router.post(
  "/verify-email",
  limitAuthRequests,
  validate({ body: verifyEmailSchema }),
  asyncHandler(authController.verifyEmail.bind(authController)),
);

router.post(
  "/resend-verification-email",
  limitAuthRequests,
  validate({ body: emailSchema }),
  asyncHandler(authController.resendVerificationEmail.bind(authController)),
);

router.post(
  "/forgot-password",
  limitAuthRequests,
  validate({ body: emailSchema }),
  asyncHandler(authController.forgotPassword.bind(authController)),
);

router.post(
  "/reset-password",
  limitAuthRequests,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword.bind(authController)),
);

router.patch(
  "/change-password",
  authenticate,
  limitAuthRequests,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword.bind(authController)),
);

export default router;
