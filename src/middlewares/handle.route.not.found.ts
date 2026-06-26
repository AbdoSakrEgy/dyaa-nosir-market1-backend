import type { Request, Response } from "express";
import { HttpStatusCode } from "../shared/utils/response/http.status.code.js";
import { getResponseLocale, t } from "../shared/i18n/i18n.js";

/**
 * Catch-all for undefined routes.
 * Must be registered AFTER all valid routes.
 */
export const handleRouteNotFound = (req: Request, res: Response): void => {
  const locale = getResponseLocale(res);
  res.status(HttpStatusCode.NOT_FOUND).json({
    success: false,
    message: t(locale, "route.notFound", {
      method: req.method,
      path: req.originalUrl,
    }),
  });
};
