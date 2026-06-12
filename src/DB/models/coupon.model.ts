import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

export type Coupon = InferSchemaType<typeof couponSchema>;

export const CouponModel =
  (models.Coupon as Model<Coupon> | undefined) ??
  model<Coupon>("Coupon", couponSchema);
