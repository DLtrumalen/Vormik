import { en } from "./en";
import { fi } from "./fi";
import { ru } from "./ru";
import { LOCALES, type Dictionary, type Locale } from "./types";

export { LOCALES, type Dictionary, type Locale };

const DICTIONARIES: Record<Locale, Dictionary> = { ru, en, fi };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Адрес главной страницы сайта на этом языке: русский — «/», остальные — «/en», «/fi». */
export function localeHref(locale: Locale) {
  return locale === "ru" ? "/" : `/${locale}`;
}

/** Код языка для Intl и атрибута lang. */
export const INTL_LOCALE: Record<Locale, string> = { ru: "ru-RU", en: "en-GB", fi: "fi-FI" };
