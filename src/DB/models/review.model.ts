import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });

export type Review = InferSchemaType<typeof reviewSchema>;

export const ReviewModel =
  (models.Review as Model<Review> | undefined) ??
  model<Review>("Review", reviewSchema);
