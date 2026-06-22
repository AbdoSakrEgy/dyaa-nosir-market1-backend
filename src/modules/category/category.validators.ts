import { z } from "zod";

// ============================ localizedCategoryNameSchema ============================
const localizedCategoryNameSchema = z.object({
  ar: z.string().min(2).max(100).trim(),
  en: z.string().min(2).max(100).trim(),
});

// ============================ categorySlugSchema ============================
const categorySlugSchema = z.string().min(1).max(120).trim().toLowerCase();

// ============================ localizedCategoryDescriptionSchema ============================
const localizedCategoryDescriptionSchema = z.object({
  ar: z.string().max(2000).trim().optional(),
  en: z.string().max(2000).trim().optional(),
});

// ============================ createCategorySchema ============================
export const createCategorySchema = z.object({
  name: localizedCategoryNameSchema,
  slug: categorySlugSchema,
  description: localizedCategoryDescriptionSchema.optional(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================ updateCategorySchema ============================
export const updateCategorySchema = z
  .object({
    name: localizedCategoryNameSchema.optional(),
    slug: categorySlugSchema.optional(),
    description: localizedCategoryDescriptionSchema.optional(),
    parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

// ============================ categoryIdentifierParamSchema ============================
export const categoryIdentifierParamSchema = z.object({
  identifier: z.string().min(1).max(120).trim(),
});

// ============================ categoryIdParamSchema ============================
export const categoryIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
});

// ============================ listCategoriesQuerySchema ============================
export const listCategoriesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().trim().max(100).optional(),
  parentId: z
    .union([z.literal("root"), z.string().regex(/^[0-9a-fA-F]{24}$/)])
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQueryDTO = z.infer<
  typeof listCategoriesQuerySchema
>;
