import type { NextFunction, Request, Response } from "express";
import { DEFAULT_LOCALE, isLocale } from "../shared/i18n/i18n.js";

export const setLocale = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const acceptLanguage = req.headers["accept-language"];
  const acceptLanguageValue = Array.isArray(acceptLanguage)
    ? acceptLanguage[0]
    : acceptLanguage;

  const acceptedLocales =
    acceptLanguageValue
      ?.split(",")
      .map((language: string) => language.trim().toLowerCase().split(";")[0])
      .map((language: string | undefined) => language?.split("-")[0]) ?? [];

  res.locals["locale"] = acceptedLocales.find(isLocale) ?? DEFAULT_LOCALE;
  next();
};
