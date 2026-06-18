import { z } from "zod";
import { Gender } from "../../shared/types/shared.types.js";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  age: z.number().min(18).max(200).optional(),
  gender: z.enum(Object.values(Gender)).optional(),
  email: z.email("Invalid email format").toLowerCase().trim(),
  phone: z
    .string()
    .min(8, "Phone must be at least 8 characters")
    .max(20, "Phone must be at most 20 characters")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const emailSchema = z.object({
  email: z.email("Invalid email format").toLowerCase().trim(),
});

export const verifyEmailSchema = emailSchema.extend({
  code: z.string().min(4, "Code must be at least 4 characters").trim(),
});

export const resetPasswordSchema = verifyEmailSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "New password must be at most 128 characters"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type EmailDTO = z.infer<typeof emailSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
