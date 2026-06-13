import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

// inventory history log
const stockTransactionSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["purchase", "sale", "return", "adjustment", "damage"],
      required: true,
    }, // Business reason for the stock movement
    quantity: { type: Number, required: true }, // Stock delta: positive for increases, negative for decreases
    previousStock: { type: Number, required: true, min: 0 }, // Product stock before applying this transaction
    newStock: { type: Number, required: true, min: 0 }, // Product stock after applying this transaction
    orderId: { type: Schema.Types.ObjectId, ref: "Order" }, // Related order when the stock movement came from a sale or return
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
  (mongoose.models.StockTransaction as Model<StockTransaction> | undefined) ??
  model<StockTransaction>("StockTransaction", stockTransactionSchema);
