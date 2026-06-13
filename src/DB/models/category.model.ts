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

const categorySchema = new Schema(
  {
    name: { type: localizedRequiredSchema, required: true },
    slug: { type: localizedRequiredSchema, required: true },
    description: { type: localizedOptionalSchema },
    parentId: { type: Schema.Types.ObjectId, ref: "Category" },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Keep localized slugs unique and speed up common category tree lookups.
categorySchema.index({ "slug.ar": 1 }, { unique: true });
categorySchema.index({ "slug.en": 1 }, { unique: true });
categorySchema.index({ parentId: 1, isActive: 1 });

export type Category = InferSchemaType<typeof categorySchema>;

export const CategoryModel =
  (mongoose.models.Category as Model<Category> | undefined) ??
  model<Category>("Category", categorySchema);
