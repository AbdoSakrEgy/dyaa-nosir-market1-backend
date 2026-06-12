import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const stockTransactionSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["purchase", "sale", "return", "adjustment", "damage"],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    reason: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

stockTransactionSchema.index({ productId: 1, createdAt: -1 });
stockTransactionSchema.index({ orderId: 1 });
stockTransactionSchema.index({ type: 1, createdAt: -1 });

export type StockTransaction = InferSchemaType<typeof stockTransactionSchema>;

export const StockTransactionModel =
  (models.StockTransaction as Model<StockTransaction> | undefined) ??
  model<StockTransaction>("StockTransaction", stockTransactionSchema);
