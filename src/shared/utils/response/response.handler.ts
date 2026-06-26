import type { Response } from "express";
import type { ApiResponse, PaginationMeta } from "../../types/shared.types.js";
import { HttpStatusCode } from "./http.status.code.js";
import { getResponseLocale, t } from "../../i18n/i18n.js";
import { TranslationParams } from "../../i18n/i18n.types.js";

/**
 * Consistent API response helper.
 * Every endpoint returns the same shape — clients can always rely on { success, message, data }.
 */
export const responseHandler = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: PaginationMeta,
  messageParams?: TranslationParams,
): void => {
  const locale = getResponseLocale(res);
  const body: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message: t(locale, message, messageParams),
    ...(meta !== undefined && { meta }),
    ...(data !== undefined && { data }),
  };

  res.status(statusCode).json(body);
};
