import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    // Means the customer can only use the coupon if the order is at least 300 EGP
    // Minimum order total required to use this coupon
    minOrderAmount: { type: Number, min: 0 },
    // Maximum discount amount this coupon can give.
    // If the order is 3000 EGP, 10% would be 300 EGP, but max is 150, so the customer only gets 150 EGP discount
    maxDiscountAmount: { type: Number, min: 0 },
    // Total number of times this coupon can be used.
    // Means only the first 100 uses are allowed
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 }, // Number of times this coupon has already been used
    startsAt: { type: Date }, // Date when this coupon becomes valid
    expiresAt: { type: Date }, // Date when this coupon stops being valid.
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

export type Coupon = InferSchemaType<typeof couponSchema>;

export const CouponModel =
  (mongoose.models.Coupon as Model<Coupon> | undefined) ??
  model<Coupon>("Coupon", couponSchema);
