import type { Metadata } from "next";
import { getDictionary, localeHref, LOCALES, type Locale } from "./index";

/** Заголовок, описание и ссылки на другие языковые версии страницы сайта. */
export function siteMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: localeHref(locale),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localeHref(l)])),
    },
  };
}
