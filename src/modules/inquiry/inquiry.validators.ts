import { z } from "zod";
import { InquiryStatus, InquiryType } from "./inquiry.types.js";

// ============================ createInquirySchema ============================
export const createInquirySchema = z
  .object({
    customerName: z.string().min(2).max(100).trim(),
    phone: z.string().min(8).max(20).trim(),
    email: z.email("validation.emailInvalid").toLowerCase().trim().optional(),
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    type: z.enum(Object.values(InquiryType)),
    message: z.string().min(5).max(3000).trim().optional(),
  })
  .refine((data) => data.type !== InquiryType.contact || Boolean(data.message), {
    path: ["message"],
    message: "inquiry.messageRequiredForContact",
  });

// ============================ updateInquirySchema ============================
export const updateInquirySchema = z
  .object({
    status: z.enum(Object.values(InquiryStatus)).optional(),
    adminNotes: z.string().max(3000).trim().nullable().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "inquiry.fieldsRequired",
  });

// ============================ inquiryIdParamSchema ============================
export const inquiryIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "validation.invalidInquiryId"),
});

// ============================ listInquiriesQuerySchema ============================
export const listInquiriesQuerySchema = z.object({
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
  status: z.enum(Object.values(InquiryStatus)).optional(),
  type: z.enum(Object.values(InquiryType)).optional(),
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export type CreateInquiryDTO = z.infer<typeof createInquirySchema>;
export type UpdateInquiryDTO = z.infer<typeof updateInquirySchema>;
export type ListInquiriesQueryDTO = z.infer<typeof listInquiriesQuerySchema>;
