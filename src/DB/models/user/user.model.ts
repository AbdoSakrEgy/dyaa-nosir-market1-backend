import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
  Types,
} from "mongoose";
import { AuthProvider, Gender } from "../../../shared/types/shared.types.js";

export interface IUser {
  // profile
  name: string;
  age?: number;
  gender: Gender;
  phone?: string;
  profileImage?: string;

  // access
  roleId: Types.ObjectId;
  email?: string;
  password?: string;
  authProvider: AuthProvider;
  googleId?: string;
  isEmailConfirmed: boolean;
  credentialsChangedAt?: Date;

  // verification
  emailOtp?: {
    otp?: string;
    expiresAt?: Date;
  };
  newEmail?: string;
  newEmailOtp?: {
    otp?: string;
    expiresAt?: Date;
  };
  passwordOtp?: {
    otp?: string;
    expiresAt?: Date;
  };

  // status
  isActive: boolean;
  deletedBy?: string;
}

const userSchema = new Schema<IUser>(
  {
    // profile
    name: {
      type: String,
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      required: true,
    },
    age: { type: Number, min: 15, max: 200 },
    gender: { type: String, default: Gender.male, enum: Object.values(Gender) },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (value?: string) => !value || isValidPhone(value),
        message: (props: { value: string }) =>
          `${props.value} is not a valid phone number!`,
      },
      unique: true,
      sparse: true,
      set: (value?: string) => (value ? normalizePhone(value) : value),
    },
    profileImage: { type: String },

    // access
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required(this: IUser) {
        return this.authProvider === AuthProvider.local;
      },
      select: false,
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.local,
    },
    googleId: { type: String, trim: true, unique: true, sparse: true },
    isEmailConfirmed: { type: Boolean, default: false },
    credentialsChangedAt: Date,

    // verification
    emailOtp: {
      otp: {
        type: String,
        select: false,
        // next code will cause error, so use mongoose lifecycle
        // set: async (value: string): Promise<string> => await hash(value),
      },
      expiresAt: { type: Date, select: false },
    },
    newEmail: { type: String },
    newEmailOtp: {
      otp: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },
    passwordOtp: {
      otp: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },

    // status
    isActive: { type: Boolean, default: true },
    deletedBy: { type: Types.ObjectId },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
);

userSchema.index({ roleId: 1 });
userSchema.index({ authProvider: 1 });

export type User = InferSchemaType<typeof userSchema>;

export const UserModel =
  (mongoose.models.User as Model<User> | undefined) ??
  model<User>("User", userSchema);

// ============================ utils ============================

function normalizePhone(value: string): string {
  const phone = value.replace(/[\s-]/g, "").replace(/^\+/, "");

  if (/^01[0125]\d{8}$/.test(phone)) return `2${phone}`;
  if (/^1[0125]\d{8}$/.test(phone)) return `20${phone}`;

  return phone;
}

function isValidPhone(value: string): boolean {
  return /^201[0125]\d{8}$/.test(normalizePhone(value));
}
