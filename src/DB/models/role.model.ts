import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type Role = InferSchemaType<typeof roleSchema>;

export const RoleModel =
  (models.Role as Model<Role> | undefined) ?? model<Role>("Role", roleSchema);
