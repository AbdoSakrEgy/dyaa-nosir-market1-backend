import { Router } from "express";
import { authController } from "./auth.controller.js";
import { asyncHandler } from "../../shared/utils/error/async.handler.js";
import { validate } from "../../middlewares/validate.js";
import {
  limitChangePasswordRequests,
  limitGoogleLoginRequests,
  limitGoogleRegisterRequests,
  limitLoginRequests,
  limitLogoutRequests,
  limitRefreshTokenRequests,
  limitRegisterRequests,
  limitVerifyEmailRequests,
  limitResendVerificationEmailRequests,
  limitForgotPasswordRequests,
  limitResetPasswordRequests,
} from "../../middlewares/limit.requests.js";
import {
  adminCredentialsIdParamSchema,
  adminLoginSchema,
  adminRegisterSchema,
  adminUpdateCredentialsSchema,
  changePasswordSchema,
  emailSchema,
  googleLoginSchema,
  googleRegisterSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  updateEmailSchema,
  verifyEmailSchema,
} from "./auth.validators.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";

const router = Router();

router.post(
  "/google-register",
  limitGoogleRegisterRequests,
  validate({ body: googleRegisterSchema }),
  asyncHandler(authController.googleRegister.bind(authController)),
);

router.post(
  "/google-login",
  limitGoogleLoginRequests,
  validate({ body: googleLoginSchema }),
  asyncHandler(authController.googleLogin.bind(authController)),
);

router.post(
  "/refresh-token",
  limitRefreshTokenRequests,
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refreshToken.bind(authController)),
);

router.post(
  "/logout",
  limitLogoutRequests,
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.logout.bind(authController)),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.me.bind(authController)),
);

router.patch(
  "/update-email",
  limitGoogleLoginRequests,
  validate({ body: updateEmailSchema }),
  asyncHandler(authController.updateEmail.bind(authController)),
);

router.post(
  "/admin-register",
  limitRegisterRequests,
  validate({ body: adminRegisterSchema }),
  asyncHandler(authController.adminRegister.bind(authController)),
);

router.post(
  "/admin-login",
  limitLoginRequests,
  validate({ body: adminLoginSchema }),
  asyncHandler(authController.adminLogin.bind(authController)),
);

router.patch(
  "/admin-update-credentials/:id",
  limitChangePasswordRequests,
  authenticate,
  authorize("admin"),
  validate({
    params: adminCredentialsIdParamSchema,
    body: adminUpdateCredentialsSchema,
  }),
  asyncHandler(authController.adminUpdateCredentials.bind(authController)),
);

// Paused legacy local customer auth APIs.
// router.post(
//   "/register",
//   limitRegisterRequests,
//   validate({ body: registerSchema }),
//   asyncHandler(authController.register.bind(authController)),
// );

// router.post(
//   "/verify-email",
//   limitVerifyEmailRequests,
//   validate({ body: verifyEmailSchema }),
//   asyncHandler(authController.verifyEmail.bind(authController)),
// );

// router.post(
//   "/resend-verification-email",
//   limitResendVerificationEmailRequests,
//   validate({ body: emailSchema }),
//   asyncHandler(authController.resendVerificationEmail.bind(authController)),
// );

// router.post(
//   "/login",
//   limitLoginRequests,
//   validate({ body: loginSchema }),
//   asyncHandler(authController.login.bind(authController)),
// );

// router.post(
//   "/forgot-password",
//   limitForgotPasswordRequests,
//   validate({ body: emailSchema }),
//   asyncHandler(authController.forgotPassword.bind(authController)),
// );

// router.post(
//   "/reset-password",
//   limitResetPasswordRequests,
//   validate({ body: resetPasswordSchema }),
//   asyncHandler(authController.resetPassword.bind(authController)),
// );

// router.patch(
//   "/change-password",
//   authenticate,
//   limitChangePasswordRequests,
//   validate({ body: changePasswordSchema }),
//   asyncHandler(authController.changePassword.bind(authController)),
// );

export default router;
