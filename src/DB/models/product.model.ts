import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

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

const dimensionsSchema = new Schema(
  {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  { _id: false },
);

const tractorDetailsSchema = new Schema(
  {
    horsepower: { type: Number, min: 0 },
    engine: { type: String, trim: true },
    driveType: { type: String, enum: ["2WD", "4WD"] },
    hoursUsed: { type: Number, min: 0 },
  },
  { _id: false },
);

const partDetailsSchema = new Schema(
  {
    partNumber: { type: String, trim: true },
    oemNumber: { type: String, trim: true },
    compatibleMachines: [{ type: Schema.Types.ObjectId, ref: "Machine" }],
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: { type: localizedRequiredSchema, required: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: localizedOptionalSchema },
    type: {
      type: String,
      enum: ["tractor", "tractor_part", "car_part"],
      required: true,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    sku: { type: String, required: true, trim: true, unique: true },
    images: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    currency: { type: String, enum: ["EGP"], default: "EGP" },
    stockQuantity: { type: Number, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock", "preorder", "contact_for_availability"],
      default: "in_stock",
    },
    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      default: "new",
    },
    warranty: { type: warrantySchema },
    specs: { type: [productSpecSchema], default: [] },
    tags: { type: localizedStringArraySchema, default: () => ({ ar: [], en: [] }) },
    weight: { type: Number, min: 0 },
    dimensions: { type: dimensionsSchema },
    tractorDetails: { type: tractorDetailsSchema },
    partDetails: { type: partDetailsSchema },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ categoryId: 1, type: 1, isPublished: 1 });
productSchema.index({ brandId: 1, isPublished: 1 });
productSchema.index({ stockStatus: 1, isPublished: 1 });
productSchema.index({ price: 1 });
productSchema.index({ "partDetails.partNumber": 1 });
productSchema.index({ "partDetails.oemNumber": 1 });
productSchema.index({ "partDetails.compatibleMachines": 1 });
productSchema.index({
  "name.ar": "text",
  "name.en": "text",
  "description.ar": "text",
  "description.en": "text",
  sku: "text",
  "partDetails.partNumber": "text",
  "partDetails.oemNumber": "text",
  "tags.ar": "text",
  "tags.en": "text",
});

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel =
  (models.Product as Model<Product> | undefined) ??
  model<Product>("Product", productSchema);
