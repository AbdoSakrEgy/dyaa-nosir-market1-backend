import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import type {
  RegisterDTO,
  LoginDTO,
  GoogleRegisterDTO,
  GoogleLoginDTO,
  RefreshTokenDTO,
  EmailDTO,
  VerifyEmailDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from "./auth.validators.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type { AuthPayload } from "../../shared/types/jwt.types.js";

export class AuthController {
  // ---------------------------- googleRegister ----------------------------
  async googleRegister(req: Request, res: Response): Promise<void> {
    const data = req.body as GoogleRegisterDTO;
    const result = await authService.googleRegister(data);
    responseHandler(
      res,
      HttpStatusCode.CREATED,
      "auth.googleRegister.success",
      result,
    );
  }

  // ---------------------------- googleLogin ----------------------------
  async googleLogin(req: Request, res: Response): Promise<void> {
    const data = req.body as GoogleLoginDTO;
    const result = await authService.googleLogin(data);
    responseHandler(res, HttpStatusCode.OK, "auth.googleLogin.success", result);
  }

  // ---------------------------- refreshToken ----------------------------
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as RefreshTokenDTO;
    const tokens = await authService.refreshToken(refreshToken);
    responseHandler(
      res,
      HttpStatusCode.OK,
      "auth.refreshToken.success",
      tokens,
    );
  }

  // ---------------------------- logout ----------------------------
  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as RefreshTokenDTO;
    await authService.logout(refreshToken);
    responseHandler(res, HttpStatusCode.OK, "auth.logout.success");
  }

  // ---------------------------- me ----------------------------
  async me(req: Request, res: Response): Promise<void> {
    const payload = (req as any).payload as AuthPayload;
    const user = await authService.me(payload.userId);
    responseHandler(
      res,
      HttpStatusCode.OK,
      "profile.retrieved",
      user,
    );
  }

  // ---------------------------- register ----------------------------
  async register(req: Request, res: Response): Promise<void> {
    const data = req.body as RegisterDTO;
    const result = await authService.register(data);
    responseHandler(
      res,
      HttpStatusCode.CREATED,
      "auth.register.success",
      result,
    );
  }

  // ---------------------------- verifyEmail ----------------------------
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const data = req.body as VerifyEmailDTO;
    await authService.verifyEmail(data);
    responseHandler(res, HttpStatusCode.OK, "auth.emailVerified");
  }

  // ---------------------------- resendVerificationEmail ----------------------------
  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    const data = req.body as EmailDTO;
    await authService.resendVerificationEmail(data.email);
    responseHandler(res, HttpStatusCode.OK, "auth.verificationEmailSent");
  }

  // ---------------------------- login ----------------------------
  async login(req: Request, res: Response): Promise<void> {
    const data = req.body as LoginDTO;
    const result = await authService.login(data);
    responseHandler(res, HttpStatusCode.OK, "auth.login.success", result);
  }

  // ---------------------------- forgotPassword ----------------------------
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data = req.body as EmailDTO;
    await authService.forgotPassword(data.email);
    responseHandler(res, HttpStatusCode.OK, "auth.forgotPassword.success");
  }

  // ---------------------------- resetPassword ----------------------------
  async resetPassword(req: Request, res: Response): Promise<void> {
    const data = req.body as ResetPasswordDTO;
    await authService.resetPassword(data);
    responseHandler(res, HttpStatusCode.OK, "auth.passwordReset.success");
  }

  // ---------------------------- changePassword ----------------------------
  async changePassword(req: Request, res: Response): Promise<void> {
    const payload = (req as any).payload as AuthPayload;
    const data = req.body as ChangePasswordDTO;
    await authService.changePassword(payload.userId, data);
    responseHandler(res, HttpStatusCode.OK, "auth.changePassword.success");
  }
}

export const authController = new AuthController();
