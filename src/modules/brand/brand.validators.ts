import { z } from "zod";
import { BrandType } from "../../shared/types/catalog.types.js";

// ============================ localizedBrandNameSchema ============================
const localizedBrandNameSchema = z.object({
  ar: z.string().min(2).max(100).trim(),
  en: z.string().min(2).max(100).trim(),
});

// ============================ localizedBrandDescriptionSchema ============================
const localizedBrandDescriptionSchema = z.object({
  ar: z.string().max(2000).trim().optional(),
  en: z.string().max(2000).trim().optional(),
});

// ============================ createBrandSchema ============================
export const createBrandSchema = z.object({
  name: localizedBrandNameSchema,
  slug: z.string().min(1).max(120).trim().toLowerCase(),
  type: z.enum(Object.values(BrandType)).optional(),
  logo: z.url("Brand logo must be a valid URL").optional(),
  description: localizedBrandDescriptionSchema.optional(),
  isActive: z.boolean().optional(),
});

// ============================ updateBrandSchema ============================
export const updateBrandSchema = z
  .object({
    name: localizedBrandNameSchema.optional(),
    slug: z.string().min(1).max(120).trim().toLowerCase().optional(),
    type: z.enum(Object.values(BrandType)).optional(),
    logo: z.url("Brand logo must be a valid URL").nullable().optional(),
    description: localizedBrandDescriptionSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one brand field is required",
  });

// ============================ brandIdentifierParamSchema ============================
export const brandIdentifierParamSchema = z.object({
  identifier: z.string().min(1).max(120).trim(),
});

// ============================ brandIdParamSchema ============================
export const brandIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid brand ID"),
});

// ============================ listBrandsQuerySchema ============================
export const listBrandsQuerySchema = z.object({
  type: z.enum(Object.values(BrandType)).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export type CreateBrandDTO = z.infer<typeof createBrandSchema>;
export type UpdateBrandDTO = z.infer<typeof updateBrandSchema>;
export type ListBrandsQueryDTO = z.infer<typeof listBrandsQuerySchema>;
