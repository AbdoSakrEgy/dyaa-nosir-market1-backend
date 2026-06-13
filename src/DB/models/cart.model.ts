import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    // Identifies a guest cart when there is no logged-in userId.
    sessionId: { type: String, trim: true },
    items: { type: [cartItemSchema], default: [] },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type Cart = InferSchemaType<typeof cartSchema>;

export const CartModel =
  (mongoose.models.Cart as Model<Cart> | undefined) ??
  model<Cart>("Cart", cartSchema);
