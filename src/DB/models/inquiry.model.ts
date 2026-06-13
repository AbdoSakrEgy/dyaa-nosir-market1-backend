import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";

const inquirySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    type: {
      type: String,
      enum: ["contact", "quote_request", "availability_check"],
      required: true,
    },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true },
);

inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ productId: 1, createdAt: -1 });
inquirySchema.index({ phone: 1, createdAt: -1 });

export type Inquiry = InferSchemaType<typeof inquirySchema>;

export const InquiryModel =
  (mongoose.models.Inquiry as Model<Inquiry> | undefined) ??
  model<Inquiry>("Inquiry", inquirySchema);
