import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    provider: {
      type: String,
      enum: ["cash_on_delivery", "paymob", "stripe", "manual"],
      required: true,
    },
    providerTransactionId: { type: String, trim: true },
    providerOrderId: { type: String, trim: true }, // order/session ID created by the payment provider
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["EGP"], default: "EGP" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentUrl: { type: String, trim: true }, // This stores the payment link from the provider
    providerResponse: { type: Schema.Types.Mixed }, // This stores the original full response from the payment provider
    paidAt: { type: Date },
  },
  { timestamps: true },
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ provider: 1, providerTransactionId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export type Payment = InferSchemaType<typeof paymentSchema>;

export const PaymentModel =
  (mongoose.models.Payment as Model<Payment> | undefined) ??
  model<Payment>("Payment", paymentSchema);
