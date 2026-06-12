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

const machineSchema = new Schema(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    name: { type: localizedRequiredSchema, required: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    type: { type: String, enum: ["tractor", "car"], required: true },
    years: { type: [Number], default: [] },
    engine: { type: String, trim: true },
    notes: { type: localizedOptionalSchema },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

machineSchema.index({ brandId: 1, type: 1, isActive: 1 });
machineSchema.index({ "name.ar": "text", "name.en": "text", engine: "text" });

export type Machine = InferSchemaType<typeof machineSchema>;

export const MachineModel =
  (models.Machine as Model<Machine> | undefined) ??
  model<Machine>("Machine", machineSchema);
