import type { MetadataRoute } from "next";
import { localeHref, LOCALES } from "@/i18n";
import { SITE_URL } from "@/lib/site";

/** Страницы сайта на трёх языках; у каждой — ссылки на две другие языковые версии. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${localeHref(l)}`]));
  return [
    ...LOCALES.map((locale) => ({
      url: `${SITE_URL}${localeHref(locale)}`,
      alternates: { languages },
      priority: 1,
    })),
    { url: `${SITE_URL}/train`, priority: 0.8 },
  ];
}
