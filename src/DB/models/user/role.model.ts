import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    permissions: { type: [{ type: String, trim: true }], default: [] },
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

roleSchema.index({ slug: 1 });

export type Role = InferSchemaType<typeof roleSchema>;

export const RoleModel =
  (mongoose.models.Role as Model<Role> | undefined) ??
  model<Role>("Role", roleSchema);
