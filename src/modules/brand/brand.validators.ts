import { z } from "zod";

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
  description: localizedBrandDescriptionSchema.optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================ updateBrandSchema ============================
export const updateBrandSchema = z
  .object({
    name: localizedBrandNameSchema.optional(),
    slug: z.string().min(1).max(120).trim().toLowerCase().optional(),
    description: localizedBrandDescriptionSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

// ============================ brandIdentifierParamSchema ============================
export const brandIdentifierParamSchema = z.object({
  identifier: z.string().min(1).max(120).trim(),
});

// ============================ brandIdParamSchema ============================
export const brandIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "validation.invalidBrandId"),
});

// ============================ listBrandsQuerySchema ============================
export const listBrandsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z
    .enum([
      "created_at_asc",
      "created_at_desc",
      "updated_at_asc",
      "updated_at_desc",
      "newest",
      "oldest",
      "name_asc",
      "name_desc",
    ])
    .optional(),
});

// ============================ listBrandsManagementQuerySchema ============================
export const listBrandsManagementQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z
    .enum([
      "created_at_asc",
      "created_at_desc",
      "updated_at_asc",
      "updated_at_desc",
      "newest",
      "oldest",
      "name_asc",
      "name_desc",
    ])
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export type CreateBrandDTO = z.infer<typeof createBrandSchema>;
export type UpdateBrandDTO = z.infer<typeof updateBrandSchema>;
export type ListBrandsQueryDTO = z.infer<typeof listBrandsQuerySchema>;
export type ListBrandsManagementQueryDTO = z.infer<
  typeof listBrandsManagementQuerySchema
>;
