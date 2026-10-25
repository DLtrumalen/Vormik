"use client";

import Link from "next/link";
import { getDictionary, type Locale } from "@/i18n";
import { promptInstall, useInstallState } from "@/lib/install";

type Props = { locale: Locale; size?: "md" | "lg" };

/**
 * Кнопка установки без подсказок: открывает системное окно установки браузера.
 * Пока браузер не готов (или вообще не умеет ставить приложения), кнопка неактивна.
 */
export function InstallButton({ locale, size = "md" }: Props) {
  const t = getDictionary(locale).install;
  const state = useInstallState();

  const sizing = size === "lg" ? "h-13 px-7 text-base rounded-2xl" : "h-11 px-5 text-sm rounded-xl";
  const base = `${sizing} inline-flex items-center justify-center gap-2 bg-brand font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand`;

  if (state === "installed") {
    return (
      <Link href="/train" className={base}>
        {t.openTrainer}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => promptInstall()}
      disabled={state !== "available"}
      className={base}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {t.download}
    </button>
  );
}
