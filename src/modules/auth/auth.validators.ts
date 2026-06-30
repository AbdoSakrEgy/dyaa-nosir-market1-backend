import { z } from "zod";
import { Gender } from "../../shared/types/shared.types.js";

// ============================ googleRegisterSchema ============================
export const googleRegisterSchema = z.object({
  googleToken: z.string().min(1, "validation.googleTokenRequired"),
});

// ============================ googleLoginSchema ============================
export const googleLoginSchema = z.object({
  googleToken: z.string().min(1, "validation.googleTokenRequired"),
});

// ============================ updateEmailSchema ============================
export const updateEmailSchema = z.object({
  googleToken: z.string().min(1, "validation.googleTokenRequired"),
});

// ============================ refreshTokenSchema ============================
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "validation.refreshTokenRequired"),
});

// ============================ adminRegisterSchema ============================
export const adminRegisterSchema = z.object({
  name: z
    .string()
    .min(3, "validation.nameMin")
    .max(50, "validation.nameMax")
    .trim(),
  age: z.number().min(18).max(200).optional(),
  gender: z.enum(Object.values(Gender)).optional(),
  phone: z
    .string()
    .min(8, "validation.phoneMin")
    .max(20, "validation.phoneMax")
    .trim(),
  password: z
    .string()
    .min(8, "validation.passwordMin")
    .max(128, "validation.passwordMax"),
});

// ============================ adminLoginSchema ============================
export const adminLoginSchema = z.object({
  phone: z
    .string()
    .min(8, "validation.phoneMin")
    .max(20, "validation.phoneMax")
    .trim(),
  password: z.string().min(1, "validation.passwordRequired"),
});

// ============================ adminCredentialsIdParamSchema ============================
export const adminCredentialsIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "validation.invalidAdminId"),
});

// ============================ adminUpdateCredentialsSchema ============================
export const adminUpdateCredentialsSchema = z
  .object({
    phone: z
      .string()
      .min(8, "validation.phoneMin")
      .max(20, "validation.phoneMax")
      .trim()
      .optional(),
    password: z
      .string()
      .min(8, "validation.passwordMin")
      .max(128, "validation.passwordMax")
      .optional(),
  })
  .refine((data) => data.phone !== undefined || data.password !== undefined, {
    message: "auth.credentialsFieldsRequired",
  });

// ============================ registerSchema ============================
export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "validation.nameMin")
    .max(50, "validation.nameMax")
    .trim(),
  age: z.number().min(18).max(200).optional(),
  gender: z.enum(Object.values(Gender)).optional(),
  phone: z
    .string()
    .min(8, "validation.phoneMin")
    .max(20, "validation.phoneMax")
    .trim(),
  email: z.email("validation.emailInvalid").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "validation.passwordMin")
    .max(128, "validation.passwordMax"),
});

// ============================ verifyEmailSchema ============================
export const verifyEmailSchema = z.object({
  email: z.email("validation.emailInvalid").toLowerCase().trim(),
  code: z.string().min(4, "validation.codeMin").trim(),
});

// ============================ emailSchema ============================
export const emailSchema = z.object({
  email: z.email("validation.emailInvalid").toLowerCase().trim(),
});

// ============================ loginSchema ============================
export const loginSchema = z.object({
  email: z.email("validation.emailInvalid").toLowerCase().trim(),
  password: z.string().min(1, "validation.passwordRequired"),
});

// ============================ resetPasswordSchema ============================
export const resetPasswordSchema = z.object({
  email: z.email("validation.emailInvalid").toLowerCase().trim(),
  code: z.string().min(4, "validation.codeMin").trim(),
  password: z
    .string()
    .min(8, "validation.passwordMin")
    .max(128, "validation.passwordMax"),
});

// ============================ changePasswordSchema ============================
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "validation.currentPasswordRequired"),
  newPassword: z
    .string()
    .min(8, "validation.newPasswordMin")
    .max(128, "validation.newPasswordMax"),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type GoogleRegisterDTO = z.infer<typeof googleRegisterSchema>;
export type GoogleLoginDTO = z.infer<typeof googleLoginSchema>;
export type UpdateEmailDTO = z.infer<typeof updateEmailSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type AdminRegisterDTO = z.infer<typeof adminRegisterSchema>;
export type AdminLoginDTO = z.infer<typeof adminLoginSchema>;
export type AdminUpdateCredentialsDTO = z.infer<
  typeof adminUpdateCredentialsSchema
>;
export type EmailDTO = z.infer<typeof emailSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
