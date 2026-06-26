import type { Response } from "express";
import { arMessages } from "./messages/ar.js";
import { enMessages } from "./messages/en.js";
import { type Locale, type TranslationParams } from "./i18n.types.js";

export const LOCALES = ["en", "ar"] as const;

export const DEFAULT_LOCALE: Locale = "ar";

const dictionaries: Record<Locale, Record<string, string>> = {
  en: enMessages,
  ar: arMessages,
};

// ============================ isLocale ============================
export const isLocale = (value: string | undefined): value is Locale => {
  return LOCALES.includes(value as Locale);
};

// ============================ getResponseLocale ============================
export const getResponseLocale = (res: Response): Locale => {
  const locale = res.locals["locale"];
  return isLocale(typeof locale === "string" ? locale : undefined)
    ? locale
    : DEFAULT_LOCALE;
};
// ============================ t ============================
export const t = (
  locale: Locale,
  key: string,
  params: TranslationParams = {},
): string => {
  const dictionary = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const fallbackDictionary = dictionaries[DEFAULT_LOCALE];
  const template = dictionary[key] ?? fallbackDictionary[key] ?? key;
  const placeholderPattern = /\{(\w+)\}/g;

  const replacePlaceholder = (
    _placeholder: string,
    paramName: string,
  ): string => {
    const paramValue = params[paramName];
    if (paramValue === undefined) return "";

    const paramKey = String(paramValue);
    return dictionary[paramKey] ?? fallbackDictionary[paramKey] ?? paramKey;
  };

  return template.replace(placeholderPattern, replacePlaceholder);
};
