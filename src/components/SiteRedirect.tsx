"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { INTL_LOCALE, localeHref, type Locale } from "@/i18n";
import { readSavedLocale } from "@/i18n/client";
import { isStandalone } from "@/lib/install";

/**
 * Служебные переходы на страницах сайта:
 * — открыто как установленное приложение → сразу в тренажёр (iPhone запоминает страницу сайта);
 * — пользователь раньше выбрал другой язык → на страницу этого языка.
 * Ссылка «О приложении» из тренажёра добавляет ?about, чтобы сайт всё-таки можно было посмотреть.
 */
export function SiteRedirect({ locale }: { locale: Locale }) {
  const router = useRouter();

  useEffect(() => {
    // Корневой layout общий для всех языков, поэтому lang выставляем здесь.
    document.documentElement.lang = INTL_LOCALE[locale].slice(0, 2);

    const about = new URLSearchParams(window.location.search).has("about");
    if (isStandalone() && !about) {
      router.replace("/train");
      return;
    }
    const saved = readSavedLocale();
    if (saved && saved !== locale && !about) router.replace(localeHref(saved));
  }, [locale, router]);

  return null;
}
