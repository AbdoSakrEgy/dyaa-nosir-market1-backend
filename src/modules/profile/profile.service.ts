import type { FilterQuery } from "mongoose";
import { UserModel, type IUser } from "../../DB/models/user/user.model.js";
import { RefreshTokenModel } from "../../DB/models/user/auth.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
import type {
  ListProfilesQueryDTO,
  UpdateProfileDTO,
} from "./profile.validators.js";
import { normalizeProfilePhone } from "./utils/normalize-profile-phone.js";

const PROFILE_FIELDS =
  "name age gender phone profileImage email authProvider isEmailConfirmed roleId isActive createdAt updatedAt";

export class ProfileService {
  // ============================ getProfile ============================
  async getProfile(userId: string) {
    // step: retrieve the authenticated profile
    const profile = await UserModel.findOne({ _id: userId, isActive: true })
      .select(PROFILE_FIELDS)
      .populate("roleId", "name slug")
      .lean();

    if (!profile) throw new NotFoundError("Profile");

    // step: result
    return profile;
  }

  // ============================ updateProfile ============================
  async updateProfile(userId: string, data: UpdateProfileDTO) {
    // step: protect phone ownership
    if (data.phone) {
      const normalizedPhone = normalizeProfilePhone(data.phone);
      const owner = await UserModel.exists({
        phone: normalizedPhone,
        _id: { $ne: userId },
      });

      if (owner) throw new ConflictError("Phone number is already used");
      data.phone = normalizedPhone;
    }

    // step: update the active profile
    const profile = await UserModel.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: data },
      { new: true, runValidators: true },
    )
      .select(PROFILE_FIELDS)
      .populate("roleId", "name slug")
      .lean();

    if (!profile) throw new NotFoundError("Profile");

    // step: result
    return profile;
  }

  // ============================ listProfiles ============================
  async listProfiles(query: ListProfilesQueryDTO) {
    // step: build allow-listed filters
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const filter: FilterQuery<IUser> = {};

    if (query.roleId) filter.roleId = query.roleId;
    if (query.isActive) filter.isActive = query.isActive === "true";
    if (query.search) {
      const keyword = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
      ];
    }

    // step: retrieve profiles and count
    const [profiles, totalItems] = await Promise.all([
      UserModel.find(filter)
        .select(PROFILE_FIELDS)
        .populate("roleId", "name slug")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    // step: result
    return {
      profiles,
      meta: {
        totalItems,
        itemCount: profiles.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  // ============================ getProfileById ============================
  async getProfileById(id: string) {
    // step: retrieve profile for administration
    const profile = await UserModel.findById(id)
      .select(PROFILE_FIELDS)
      .populate("roleId", "name slug")
      .lean();

    if (!profile) throw new NotFoundError("Profile");

    // step: result
    return profile;
  }

  // ============================ updateProfileStatus ============================
  async updateProfileStatus(id: string, isActive: boolean, actorId: string) {
    // step: prevent self-deactivation
    if (id === actorId && !isActive) {
      throw new BadRequestError("You cannot deactivate your own account");
    }

    // step: update account status
    const profile = await UserModel.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true, runValidators: true },
    )
      .select(PROFILE_FIELDS)
      .populate("roleId", "name slug")
      .lean();

    if (!profile) throw new NotFoundError("Profile");

    // step: revoke sessions for a deactivated account
    if (!isActive) {
      await RefreshTokenModel.updateMany(
        { userId: id, revokedAt: { $exists: false } },
        { $set: { revokedAt: new Date() } },
      );
    }

    // step: result
    return profile;
  }
}

export const profileService = new ProfileService();
