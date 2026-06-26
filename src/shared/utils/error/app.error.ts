import type { TranslationParams } from "../../i18n/i18n.types.js";
import { HttpStatusCode } from "../response/http.status.code.js";

/**
 * Custom application error class.
 *
 * Why extend Error instead of using plain objects?
 * - Preserves stack trace for debugging
 * - Works with instanceof checks in the error middleware
 * - Carries HTTP status code so the error middleware knows exactly what to return
 *
 * `isOperational` distinguishes expected errors (bad input, not found)
 * from unexpected bugs (null pointer, DB crash). Only operational errors
 * are safe to expose to the client.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly messageParams: TranslationParams;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    isOperational = true,
    messageParams: TranslationParams = {},
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.messageParams = messageParams;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ========================
// Convenience Subclasses
// ========================

export class NotFoundError extends AppError {
  constructor(resource = "resource.generic") {
    super("error.notFound", HttpStatusCode.NOT_FOUND, true, { resource });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "error.unauthorized", messageParams?: TranslationParams) {
    super(message, HttpStatusCode.UNAUTHORIZED, true, messageParams);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "error.forbidden", messageParams?: TranslationParams) {
    super(message, HttpStatusCode.FORBIDDEN, true, messageParams);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "error.badRequest", messageParams?: TranslationParams) {
    super(message, HttpStatusCode.BAD_REQUEST, true, messageParams);
  }
}

export class ConflictError extends AppError {
  constructor(message = "error.conflict", messageParams?: TranslationParams) {
    super(message, HttpStatusCode.CONFLICT, true, messageParams);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message = "error.serviceUnavailable",
    messageParams?: TranslationParams,
  ) {
    super(message, HttpStatusCode.SERVICE_UNAVAILABLE, true, messageParams);
  }
}
