import type { FilterQuery, SortOrder } from "mongoose";
import { UserModel, type IUser } from "../../DB/models/user/user.model.js";
import { RefreshTokenModel } from "../../DB/models/user/auth.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/utils/error/app.error.js";
import {
  destroySingleFile,
  extractPublicIdFromUrl,
  uploadSingleBuffer,
} from "../../shared/utils/cloudinary/cloudinary.service.js";
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
  async updateProfile(
    userId: string,
    data: UpdateProfileDTO,
    profileImageFile?: Express.Multer.File,
  ) {
    // step: require a body field or uploaded profile image
    if (Object.keys(data).length === 0 && !profileImageFile) {
      throw new BadRequestError("At least one profile field is required");
    }

    // step: retrieve the current active profile
    const existing = await UserModel.findOne({
      _id: userId,
      isActive: true,
    }).lean();
    if (!existing) throw new NotFoundError("Profile");

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

    // step: upload the supplied profile image
    let uploadedPublicId: string | undefined;
    let uploadedProfileImageUrl: string | undefined;
    if (profileImageFile) {
      const uploadedImage = await uploadSingleBuffer({
        fileBuffer: profileImageFile.buffer,
        storagePathOnCloudinary: "profiles",
      });
      uploadedPublicId = uploadedImage.public_id;
      uploadedProfileImageUrl = uploadedImage.secure_url;
    }

    // step: update the active profile
    const update: Record<string, unknown> = { ...data };
    if (uploadedProfileImageUrl) {
      update["profileImage"] = uploadedProfileImageUrl;
    }
    let profile;
    try {
      profile = await UserModel.findOneAndUpdate(
        { _id: userId, isActive: true },
        { $set: update },
        { new: true, runValidators: true },
      )
        .select(PROFILE_FIELDS)
        .populate("roleId", "name slug")
        .lean();
    } catch (error) {
      if (uploadedPublicId) {
        await destroySingleFile({ public_id: uploadedPublicId }).catch(
          () => undefined,
        );
      }
      throw error;
    }

    if (!profile) {
      if (uploadedPublicId) {
        await destroySingleFile({ public_id: uploadedPublicId }).catch(
          () => undefined,
        );
      }
      throw new NotFoundError("Profile");
    }

    // step: remove the replaced Cloudinary profile image
    if (
      uploadedProfileImageUrl &&
      existing.profileImage !== uploadedProfileImageUrl
    ) {
      const oldPublicId = existing.profileImage
        ? extractPublicIdFromUrl(existing.profileImage)
        : null;
      if (oldPublicId) {
        await destroySingleFile({ public_id: oldPublicId }).catch(
          () => undefined,
        );
      }
    }

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
    const sortOptions: Record<string, Record<string, SortOrder>> = {
      created_at_asc: { createdAt: 1 },
      created_at_desc: { createdAt: -1 },
      updated_at_asc: { updatedAt: 1 },
      updated_at_desc: { updatedAt: -1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    };
    const sort = sortOptions[query.sort ?? "newest"] ?? { createdAt: -1 };

    // step: retrieve profiles and count
    const [profiles, totalItems] = await Promise.all([
      UserModel.find(filter)
        .select(PROFILE_FIELDS)
        .populate("roleId", "name slug")
        .sort(sort)
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
