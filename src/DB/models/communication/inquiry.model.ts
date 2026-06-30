import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const localizedRequiredSchema = new Schema(
  {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productSnapshotSchema = new Schema(
  {
    name: { type: localizedRequiredSchema, required: true },
    slug: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
  },
  { _id: false },
);

const adminResponseSchema = new Schema(
  {
    paymentMethod: { type: String, trim: true },
    deliveryEstimate: { type: String, trim: true },
    productPrice: { type: Number, min: 0 },
    shippingPrice: { type: Number, min: 0 },
    totalPrice: { type: Number, min: 0 },
  },
  { _id: false },
);

const inquirySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    createdByAdminId: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, trim: true },
    phone: { type: [String], default: [] },
    email: { type: String, trim: true, lowercase: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    requestType: {
      type: String,
      enum: ["purchase_request"],
      default: "purchase_request",
      required: true,
    },
    locationLink: { type: String, trim: true },
    locationDescription: { type: String, trim: true },
    message: { type: String, trim: true },
    productSnapshot: { type: productSnapshotSchema, required: true },
    requestStatus: {
      type: String,
      enum: ["pending_review", "completed"],
      default: "pending_review",
    },
    adminResponse: { type: adminResponseSchema },
    adminNotes: { type: String, trim: true },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

inquirySchema.index({ requestStatus: 1, createdAt: -1 });
inquirySchema.index({ productId: 1, createdAt: -1 });
inquirySchema.index({ phone: 1, createdAt: -1 });

export type Inquiry = InferSchemaType<typeof inquirySchema>;

export const InquiryModel =
  (mongoose.models.Inquiry as Model<Inquiry> | undefined) ??
  model<Inquiry>("Inquiry", inquirySchema);
