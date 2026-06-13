import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const roleSchema = new Schema(
  {
    // name is what you show in the UI
    name: { type: String, required: true, trim: true },
    // slug is what you use in code, URLs, filters, and permission logic
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    permissions: { type: [String], default: [] },
    // isSystem means this role is a built-in (protected from deletion) or created by the system
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type Role = InferSchemaType<typeof roleSchema>;

export const RoleModel =
  (mongoose.models.Role as Model<Role> | undefined) ??
  model<Role>("Role", roleSchema);
