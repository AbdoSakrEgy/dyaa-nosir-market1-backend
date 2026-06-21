import { z } from "zod";
import {
  ProductCondition,
  ProductStockStatus,
} from "../../shared/types/catalog.types.js";

// ============================ localizedProductNameSchema ============================
const localizedProductNameSchema = z.object({
  ar: z.string().min(2).max(200).trim(),
  en: z.string().min(2).max(200).trim(),
});

// ============================ localizedProductDescriptionSchema ============================
const localizedProductDescriptionSchema = z.object({
  ar: z.string().max(10000).trim().optional(),
  en: z.string().max(10000).trim().optional(),
});

// ============================ localizedProductTagsSchema ============================
const localizedProductTagsSchema = z.object({
  ar: z.array(z.string().min(1).max(50).trim()).max(30).optional(),
  en: z.array(z.string().min(1).max(50).trim()).max(30).optional(),
});

// ============================ productSpecSchema ============================
const productSpecSchema = z.object({
  key: localizedProductNameSchema,
  value: localizedProductNameSchema,
});

// ============================ productWarrantySchema ============================
const productWarrantySchema = z.object({
  hasWarranty: z.boolean(),
  duration: z.string().max(100).trim().optional(),
  details: localizedProductDescriptionSchema.optional(),
});

// ============================ createProductSchema ============================
export const createProductSchema = z
  .object({
    name: localizedProductNameSchema,
    slug: z.string().min(1).max(220).trim().toLowerCase(),
    description: localizedProductDescriptionSchema.optional(),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    brandId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    sku: z.string().min(1).max(100).trim().toUpperCase(),
    price: z.number().nonnegative(),
    discountPrice: z.number().nonnegative().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    stockStatus: z.enum(Object.values(ProductStockStatus)).optional(),
    condition: z.enum(Object.values(ProductCondition)).optional(),
    warranty: productWarrantySchema.optional(),
    specs: z.array(productSpecSchema).max(100).optional(),
    tags: localizedProductTagsSchema.optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.discountPrice === undefined || data.discountPrice <= data.price,
    {
      path: ["discountPrice"],
      message: "Discount price cannot exceed the regular price",
    },
  );

// ============================ updateProductSchema ============================
export const updateProductSchema = z
  .object({
    name: localizedProductNameSchema.optional(),
    slug: z.string().min(1).max(220).trim().toLowerCase().optional(),
    description: localizedProductDescriptionSchema.optional(),
    categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    brandId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
    sku: z.string().min(1).max(100).trim().toUpperCase().optional(),
    price: z.number().nonnegative().optional(),
    discountPrice: z.number().nonnegative().nullable().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    stockStatus: z.enum(Object.values(ProductStockStatus)).optional(),
    condition: z.enum(Object.values(ProductCondition)).optional(),
    warranty: productWarrantySchema.nullable().optional(),
    specs: z.array(productSpecSchema).max(100).optional(),
    tags: localizedProductTagsSchema.optional(),
    isFeatured: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

// ============================ productIdentifierParamSchema ============================
export const productIdentifierParamSchema = z.object({
  identifier: z.string().min(1).max(220).trim(),
});

// ============================ productIdParamSchema ============================
export const productIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
});

// ============================ listProductsQuerySchema ============================
export const listProductsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().trim().max(100).optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  brandId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  stockStatus: z.enum(Object.values(ProductStockStatus)).optional(),
  condition: z.enum(Object.values(ProductCondition)).optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  isPublished: z.enum(["true", "false"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
    ])
    .optional(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ListProductsQueryDTO = z.infer<typeof listProductsQuerySchema>;
