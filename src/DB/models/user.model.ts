import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const addressSchema = new Schema(
  {
    label: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    building: { type: String, trim: true },
    floor: { type: String, trim: true },
    apartment: { type: String, trim: true },
    notes: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    phone: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, select: false },
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    addresses: { type: [addressSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ roleId: 1 });

export type User = InferSchemaType<typeof userSchema>;

export const UserModel =
  (mongoose.models.User as Model<User> | undefined) ??
  model<User>("User", userSchema);
