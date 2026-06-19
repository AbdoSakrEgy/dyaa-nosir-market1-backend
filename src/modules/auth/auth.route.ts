import { Router } from "express";
import { authController } from "./auth.controller.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import { validate } from "../../middlewares/validate.js";
import {
  limitGoogleRegisterRequests,
  limitGoogleLoginRequests,
  limitRefreshTokenRequests,
  limitLogoutRequests,
  limitRegisterRequests,
  limitVerifyEmailRequests,
  limitResendVerificationEmailRequests,
  limitLoginRequests,
  limitForgotPasswordRequests,
  limitResetPasswordRequests,
  limitChangePasswordRequests,
} from "../../middlewares/limit.requests.js";
import {
  registerSchema,
  loginSchema,
  googleRegisterSchema,
  googleLoginSchema,
  refreshTokenSchema,
  emailSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validators.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = Router();

router.post(
  "/google-register",
  // limitGoogleRegisterRequests,
  validate({ body: googleRegisterSchema }),
  asyncHandler(authController.googleRegister.bind(authController)),
);

router.post(
  "/google-login",
  // limitGoogleLoginRequests,
  validate({ body: googleLoginSchema }),
  asyncHandler(authController.googleLogin.bind(authController)),
);

router.post(
  "/refresh-token",
  // limitRefreshTokenRequests,
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshToken.bind(authController)),
);

router.post(
  "/logout",
  // limitLogoutRequests,
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.logout.bind(authController)),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.me.bind(authController)),
);

router.post(
  "/register",
  // limitRegisterRequests,
  validate({ body: registerSchema }),
  asyncHandler(authController.register.bind(authController)),
);

router.post(
  "/verify-email",
  // limitVerifyEmailRequests,
  validate({ body: verifyEmailSchema }),
  asyncHandler(authController.verifyEmail.bind(authController)),
);

router.post(
  "/resend-verification-email",
  // limitResendVerificationEmailRequests,
  validate({ body: emailSchema }),
  asyncHandler(authController.resendVerificationEmail.bind(authController)),
);

router.post(
  "/login",
  // limitLoginRequests,
  validate({ body: loginSchema }),
  asyncHandler(authController.login.bind(authController)),
);

router.post(
  "/forgot-password",
  // limitForgotPasswordRequests,
  validate({ body: emailSchema }),
  asyncHandler(authController.forgotPassword.bind(authController)),
);

router.post(
  "/reset-password",
  // limitResetPasswordRequests,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword.bind(authController)),
);

router.patch(
  "/change-password",
  authenticate,
  // limitChangePasswordRequests,
  validate({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword.bind(authController)),
);

export default router;
