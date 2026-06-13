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

const localizedOptionalSchema = new Schema(
  {
    ar: { type: String, trim: true },
    en: { type: String, trim: true },
  },
  { _id: false },
);

const brandSchema = new Schema(
  {
    name: { type: localizedRequiredSchema, required: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    logo: { type: String, trim: true },
    description: { type: localizedOptionalSchema },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

brandSchema.index({ type: 1, isActive: 1 });

export type Brand = InferSchemaType<typeof brandSchema>;

export const BrandModel =
  (mongoose.models.Brand as Model<Brand> | undefined) ??
  model<Brand>("Brand", brandSchema);
