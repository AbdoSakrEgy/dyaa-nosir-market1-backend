import mongoose, {
  Schema,
  model,
  type InferSchemaType,
  type Model,
} from "mongoose";
import {
  ProductCondition,
  ProductStockStatus,
  ProductType,
} from "../../../shared/types/catalog.types.js";

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

const localizedStringArraySchema = new Schema(
  {
    ar: { type: [String], default: [] },
    en: { type: [String], default: [] },
  },
  { _id: false },
);

const productSpecSchema = new Schema(
  {
    key: { type: localizedRequiredSchema, required: true },
    value: { type: localizedRequiredSchema, required: true },
  },
  { _id: false },
);

const warrantySchema = new Schema(
  {
    hasWarranty: { type: Boolean, default: false },
    duration: { type: String, trim: true },
    details: { type: localizedOptionalSchema },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: localizedRequiredSchema, required: true },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: { type: localizedOptionalSchema },
    type: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    // SKU is the unique business/inventory code for this product, separate from MongoDB's _id.
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    currency: { type: String, enum: ["EGP"], default: "EGP" },
    stockQuantity: { type: Number, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: Object.values(ProductStockStatus),
      default: ProductStockStatus.outOfStock,
    },
    condition: {
      type: String,
      enum: Object.values(ProductCondition),
      default: ProductCondition.new,
    },
    warranty: { type: warrantySchema },
    specs: { type: [productSpecSchema], default: [] },
    tags: {
      type: localizedStringArraySchema,
      default: () => ({ ar: [], en: [] }),
    },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ categoryId: 1, type: 1, isPublished: 1, isActive: 1 });
productSchema.index({ brandId: 1, isPublished: 1 });
productSchema.index({ stockStatus: 1, isPublished: 1 });
productSchema.index({ price: 1 });
productSchema.index({
  "name.ar": "text",
  "name.en": "text",
  "description.ar": "text",
  "description.en": "text",
  sku: "text",
  "tags.ar": "text",
  "tags.en": "text",
});

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel =
  (mongoose.models.Product as Model<Product> | undefined) ??
  model<Product>("Product", productSchema);
