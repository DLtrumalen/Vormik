import type { Metadata } from "next";
import { getDictionary, INTL_LOCALE, localeHref, LOCALES, type Locale } from "./index";

const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Vormik" };

/**
 * Заголовок, описание, ссылки на другие языковые версии и карточка для соцсетей и мессенджеров
 * (Open Graph): с ней ссылка на сайт показывается с названием, описанием и картинкой.
 */
export function siteMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: localeHref(locale),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localeHref(l)])),
    },
    openGraph: {
      type: "website",
      siteName: "Vormik",
      title: t.meta.title,
      description: t.meta.description,
      url: localeHref(locale),
      locale: INTL_LOCALE[locale].replace("-", "_"),
      // Свой openGraph страницы заменяет унаследованный, поэтому картинку (src/app/opengraph-image.tsx)
      // указываем явно.
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: [OG_IMAGE],
    },
  };
}
