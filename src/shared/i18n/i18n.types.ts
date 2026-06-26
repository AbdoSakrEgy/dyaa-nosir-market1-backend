import { LOCALES } from "./i18n.js";

export type Locale = (typeof LOCALES)[number];
export type TranslationParams = Record<string, string | number | boolean>;
