import dotenv from "dotenv";

dotenv.config();

/**
 * Centralized environment configuration.
 * All env variables are accessed through this object — never directly via process.env.
 * This makes it easy to validate, type-check, and mock configuration in tests.
 */
export const env = {
  // ======================== Shared ========================
  NODE_ENV: process.env["NODE_ENV"] ?? "development",
  PORT: parseInt(process.env["PORT"] ?? "5000", 10),
  APP_NAME: process.env["APP_NAME"] ?? "",

  get isDevelopment() {
    return this.NODE_ENV === "development";
  },
  get isProduction() {
    return this.NODE_ENV === "production";
  },
  get isTest() {
    return this.NODE_ENV === "test";
  },

  // ======================== database.ts ========================
  DATABASE_URL: process.env["DATABASE_URL"] ?? "",

  // ======================== jwt.ts / decode.token.ts ========================
  JWT_ACCESS_SECRET: process.env["JWT_ACCESS_SECRET"] ?? "",
  JWT_REFRESH_SECRET: process.env["JWT_REFRESH_SECRET"] ?? "",
  JWT_ACCESS_EXPIRES_IN: process.env["JWT_ACCESS_EXPIRES_IN"] ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d",

  // ======================== crypto.ts ========================
  CRYPTO_SECRET_KEY: process.env["CRYPTO_SECRET_KEY"] ?? "",

  // ======================== bcrypt.ts ========================
  BCRYPT_SALT: process.env["SALT"] ?? "",

  // ======================== limit.requests.ts ========================
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env["RATE_LIMIT_WINDOW_MS"] ?? "900000",
    10,
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env["RATE_LIMIT_MAX_REQUESTS"] ?? "100",
    10,
  ),

  // ======================== send.email.ts ========================
  NODEMAILER_HOST: process.env["NODEMAILER_HOST"] ?? "",
  NODEMAILER_PORT: parseInt(process.env["NODEMAILER_PORT"] ?? "587", 10),
  NODEMAILER_SENDER_EMAIL: process.env["NODEMAILER_SENDER_EMAIL"] ?? "",
  NODEMAILER_SENDER_EMAIL_GOOGLE_APP_PASSWORD:
    process.env["NODEMAILER_SENDER_EMAIL_GOOGLE_APP_PASSWORD"] ?? "",

  // ======================== multer.upload.ts ========================
  MULTER_MAX_FILE_SIZE_MB: parseInt(
    process.env["MAX_FILE_SIZE_MB"] ?? "200",
    10,
  ),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env["CLOUDINARY_CLOUD_NAME"] ?? "",
  CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"] ?? "",
  CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"] ?? "",

  // AWS
  AWS_ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY_ID"] ?? "",
  AWS_SECRET_ACCESS_KEY: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
  AWS_REGION: process.env["AWS_REGION"] ?? "us-east-1",
  AWS_S3_BUCKET: process.env["AWS_S3_BUCKET"] ?? "",

  // stripe.ts / stipe.service.ts
  STRIPE_SECRET_KEY: process.env["STRIPE_SECRET_KEY"] ?? "",
  STRIPE_WEBHOOK_SECRET: process.env["STRIPE_WEBHOOK_SECRET"] ?? "",
  STRIPE_SUCCESS_URL: process.env["STRIPE_SUCCESS_URL"] ?? "",
  STRIPE_CANCEL_URL: process.env["STRIPE_CANCEL_URL"] ?? "",

  // paymob.config.ts / paymob.service.ts
  PAYMOB_SECRET_KEY: process.env["PAYMOB_SECRET_KEY"] ?? "",
  PAYMOB_PUBLIC_KEY: process.env["PAYMOB_PUBLIC_KEY"] ?? "",
  PAYMOB_API_KEY: process.env["PAYMOB_API_KEY"] ?? "",
  PAYMOB_INTEGRATION_ID: process.env["PAYMOB_INTEGRATION_ID"] ?? "",
  PAYMOB_HMAC_SECRET: process.env["PAYMOB_HMAC_SECRET"] ?? "",
  PAYMOB_BASE_URL:
    process.env["PAYMOB_BASE_URL"] ?? "https://accept.paymob.com",
  PAYMOB_AUTH_TOKEN_TTL_MS: parseInt(
    process.env["PAYMOB_AUTH_TOKEN_TTL_MS"] ?? "3300000",
    10,
  ),

  // Firebase
  FIREBASE_PROJECT_ID: process.env["FIREBASE_PROJECT_ID"] ?? "",

  // Redis
  REDIS_URL: process.env["REDIS_URL"] ?? "",
  
  // ======================== verify-google-token.ts ========================
  GOOGLE_WEB_CLIENT_ID: process.env["GOOGLE_WEB_CLIENT_ID"] ?? "",

} as const;
