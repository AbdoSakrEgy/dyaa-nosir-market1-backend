import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";
import { USER_ROLES } from "../../../shared/types/shared.types.js";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      enum: USER_ROLES,
    },
    permissions: { type: [{ type: String, trim: true }], default: [] },
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type Role = InferSchemaType<typeof roleSchema>;

export const RoleModel =
  (mongoose.models.Role as Model<Role> | undefined) ??
  model<Role>("Role", roleSchema);
