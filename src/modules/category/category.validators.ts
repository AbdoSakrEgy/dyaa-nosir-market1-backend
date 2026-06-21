import { z } from "zod";

// ============================ localizedCategoryNameSchema ============================
const localizedCategoryNameSchema = z.object({
  ar: z.string().min(2).max(100).trim(),
  en: z.string().min(2).max(100).trim(),
});

// ============================ localizedCategorySlugSchema ============================
const localizedCategorySlugSchema = z.object({
  ar: z.string().min(1).max(120).trim().toLowerCase(),
  en: z.string().min(1).max(120).trim().toLowerCase(),
});

// ============================ localizedCategoryDescriptionSchema ============================
const localizedCategoryDescriptionSchema = z.object({
  ar: z.string().max(2000).trim().optional(),
  en: z.string().max(2000).trim().optional(),
});

// ============================ createCategorySchema ============================
export const createCategorySchema = z.object({
  name: localizedCategoryNameSchema,
  slug: localizedCategorySlugSchema,
  description: localizedCategoryDescriptionSchema.optional(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  image: z.url("Category image must be a valid URL").optional(),
  isActive: z.boolean().optional(),
});

// ============================ updateCategorySchema ============================
export const updateCategorySchema = z
  .object({
    name: localizedCategoryNameSchema.optional(),
    slug: localizedCategorySlugSchema.optional(),
    description: localizedCategoryDescriptionSchema.optional(),
    parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
    image: z.url("Category image must be a valid URL").nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one category field is required",
  });

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
