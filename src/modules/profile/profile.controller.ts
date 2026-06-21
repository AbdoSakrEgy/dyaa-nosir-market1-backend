import type { Request, Response } from "express";
import { profileService } from "./profile.service.js";
import { responseHandler } from "../../shared/utils/response/response.handler.js";
import { HttpStatusCode } from "../../shared/utils/response/http.status.code.js";
import type { AuthPayload } from "../../shared/types/jwt.types.js";
import type {
  ListProfilesQueryDTO,
  UpdateProfileDTO,
  UpdateProfileStatusDTO,
} from "./profile.validators.js";

export class ProfileController {
  // ---------------------------- getProfile ----------------------------
  async getProfile(req: Request, res: Response): Promise<void> {
    const payload = (req as any).payload as AuthPayload;
    const profile = await profileService.getProfile(payload.userId);
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Profile retrieved successfully",
      profile,
    );
  }

  // ---------------------------- updateProfile ----------------------------
  async updateProfile(req: Request, res: Response): Promise<void> {
    const payload = (req as any).payload as AuthPayload;
    const data = req.body as UpdateProfileDTO;
    const profile = await profileService.updateProfile(payload.userId, data);
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Profile updated successfully",
      profile,
    );
  }

  // ---------------------------- listProfiles ----------------------------
  async listProfiles(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ListProfilesQueryDTO;
    const { profiles, meta } = await profileService.listProfiles(query);
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Profiles retrieved successfully",
      profiles,
      meta,
    );
  }

  // ---------------------------- getProfileById ----------------------------
  async getProfileById(req: Request, res: Response): Promise<void> {
    const profile = await profileService.getProfileById(
      req.params["id"] as string,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Profile retrieved successfully",
      profile,
    );
  }

  // ---------------------------- updateProfileStatus ----------------------------
  async updateProfileStatus(req: Request, res: Response): Promise<void> {
    const payload = (req as any).payload as AuthPayload;
    const { isActive } = req.body as UpdateProfileStatusDTO;
    const profile = await profileService.updateProfileStatus(
      req.params["id"] as string,
      isActive,
      payload.userId,
    );
    responseHandler(
      res,
      HttpStatusCode.OK,
      "Profile status updated successfully",
      profile,
    );
  }
}

export const profileController = new ProfileController();
