import type { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import type {
  RegisterDTO,
  LoginDTO,
  RefreshTokenDTO,
  EmailDTO,
  VerifyEmailDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from "./auth.validators.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type { AuthPayload } from "../../shared/types/jwt.types.js";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const data = req.body as RegisterDTO;
    const result = await authService.register(data);
    responseHandler(
      res,
      HttpStatusCode.CREATED,
      "Registration successful",
      result,
    );
  }

  async login(req: Request, res: Response): Promise<void> {
    const data = req.body as LoginDTO;
    const result = await authService.login(data);
    responseHandler(res, HttpStatusCode.OK, "Login successful", result);
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as RefreshTokenDTO;
    const tokens = await authService.refreshToken(refreshToken);
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Token refreshed successfully",
      tokens,
    );
  }

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as RefreshTokenDTO;
    await authService.logout(refreshToken);
    responseHandler(res, HttpStatusCode.OK, "Logout successful");
  }

  async me(req: Request, res: Response): Promise<void> {
    const payload = (req as any).payload as AuthPayload;
    const user = await authService.me(payload.userId);
    responseHandler(res, HttpStatusCode.OK, "Profile retrieved successfully", user);
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const data = req.body as VerifyEmailDTO;
    await authService.verifyEmail(data);
    responseHandler(res, HttpStatusCode.OK, "Email verified successfully");
  }

  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    const data = req.body as EmailDTO;
    await authService.resendVerificationEmail(data.email);
    responseHandler(res, HttpStatusCode.OK, "Verification email sent");
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const data = req.body as EmailDTO;
    await authService.forgotPassword(data.email);
    responseHandler(res, HttpStatusCode.OK, "Password reset email sent");
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const data = req.body as ResetPasswordDTO;
    await authService.resetPassword(data);
    responseHandler(res, HttpStatusCode.OK, "Password reset successfully");
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const payload = (req as any).payload as AuthPayload;
    const data = req.body as ChangePasswordDTO;
    await authService.changePassword(payload.userId, data);
    responseHandler(res, HttpStatusCode.OK, "Password changed successfully");
  }
}

export const authController = new AuthController();
