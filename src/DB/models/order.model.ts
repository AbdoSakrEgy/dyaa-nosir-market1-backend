import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

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
    imageSnapshot: { type: String, trim: true },
    priceSnapshot: { type: Number, required: true, min: 0 }, // product.discountPrice ?? product.price
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 }, // priceSnapshot * quantity
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: customerSchema, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 }, // the sum of all order item totals before shipping and order-level discount
    shippingFees: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }, // is the final amount the customer should pay
    currency: { type: String, enum: ["EGP"], default: "EGP" },
    shippingAddress: { type: addressSchema, required: true },
    orderStatus: {
      type: String,
      enum: [
        "pending", // Order was created, but not confirmed yet
        "confirmed", // Store/admin accepted the order
        "processing", // Order is being prepared/packed
        "shipped", // Order left the store and is with delivery
        "delivered", // Customer received the order
        "cancelled", // Order was cancelled
      ],
      default: "pending",
    },
    notes: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ "customer.phone": 1, createdAt: -1 });

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel =
  (mongoose.models.Order as Model<Order> | undefined) ??
  model<Order>("Order", orderSchema);
