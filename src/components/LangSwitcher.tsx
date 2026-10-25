"use client";

import { useRouter } from "next/navigation";
import { saveLocale } from "@/i18n/client";
import { getDictionary, isLocale, localeHref, LOCALES, type Locale } from "@/i18n";

type Props = {
  locale: Locale;
  /** На сайте выбор языка ведёт на страницу этого языка, в приложении — меняет язык на месте. */
  mode: "site" | "app";
  className?: string;
};

const SHORT: Record<Locale, string> = { ru: "RU", en: "EN", fi: "FI" };

export function LangSwitcher({ locale, mode, className = "" }: Props) {
  const router = useRouter();

  function change(value: string) {
    if (!isLocale(value)) return;
    saveLocale(value);
    if (mode === "site") router.push(localeHref(value));
  }

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{getDictionary(locale).language}</span>
      <svg
        className="pointer-events-none absolute left-2.5 text-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
      <select
        value={locale}
        onChange={(e) => change(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-xl border border-line bg-surface pr-3 pl-8 text-sm font-medium text-foreground hover:border-brand focus:border-brand focus:outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {mode === "app" ? SHORT[l] : `${SHORT[l]} · ${getDictionary(l).name}`}
          </option>
        ))}
      </select>
    </label>
  );
}
