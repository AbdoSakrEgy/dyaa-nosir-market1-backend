import { z } from "zod";
import { Gender } from "../../shared/types/shared.types.js";

// ============================ updateProfileSchema ============================
export const updateProfileSchema = z
  .object({
    name: z.string().min(3).max(50).trim().optional(),
    age: z.number().int().min(18).max(200).optional(),
    gender: z.enum(Object.values(Gender)).optional(),
    phone: z.string().min(8).max(20).trim().optional(),
    profileImage: z.url("Profile image must be a valid URL").optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one profile field is required",
  });

// ============================ profileIdParamSchema ============================
export const profileIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid profile ID"),
});

// ============================ listProfilesQuerySchema ============================
export const listProfilesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().trim().max(100).optional(),
  roleId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

// ============================ updateProfileStatusSchema ============================
export const updateProfileStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export type ListProfilesQueryDTO = z.infer<typeof listProfilesQuerySchema>;
export type UpdateProfileStatusDTO = z.infer<
  typeof updateProfileStatusSchema
>;
