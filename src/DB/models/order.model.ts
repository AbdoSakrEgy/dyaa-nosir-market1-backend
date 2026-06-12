import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false },
);

const addressSchema = new Schema(
  {
    city: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    building: { type: String, trim: true },
    floor: { type: String, trim: true },
    apartment: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    nameSnapshot: { type: String, required: true, trim: true },
    skuSnapshot: { type: String, required: true, trim: true },
    partNumberSnapshot: { type: String, trim: true },
    imageSnapshot: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    priceSnapshot: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: customerSchema, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFees: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["EGP"], default: "EGP" },
    shippingAddress: { type: addressSchema, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "paymob", "stripe", "manual"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    guestAccessToken: { type: String, select: false },
    notes: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ "customer.phone": 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1 });

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel =
  (models.Order as Model<Order> | undefined) ?? model<Order>("Order", orderSchema);
