"use client";

import Link from "next/link";
import { useState } from "react";
import { getDictionary, type Locale } from "@/i18n";
import { promptInstall, useInstallState } from "@/lib/install";
import { InstallGuide } from "./InstallGuide";

type Props = { locale: Locale; size?: "md" | "lg"; tone?: "brand" | "light" };

export function InstallButton({ locale, size = "md", tone = "brand" }: Props) {
  const t = getDictionary(locale).install;
  const state = useInstallState();
  const [guideOpen, setGuideOpen] = useState(false);

  const sizing = size === "lg" ? "h-13 px-7 text-base rounded-2xl" : "h-11 px-5 text-sm rounded-xl";
  const colors =
    tone === "light"
      ? "bg-white text-brand hover:bg-white/90 focus-visible:outline-white"
      : "bg-brand text-white hover:bg-brand-strong focus-visible:outline-brand";
  const base = `${sizing} ${colors} inline-flex items-center justify-center gap-2 font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2`;

  if (state === "installed") {
    return (
      <div className="flex flex-col items-start gap-2">
        <Link href="/train" className={base}>
          {t.openTrainer}
        </Link>
        <p className={`text-sm ${tone === "light" ? "text-white/80" : "text-muted"}`}>
          {t.alreadyInstalled}
        </p>
      </div>
    );
  }

  async function handleClick() {
    // Chrome готов — сразу системное окно установки, иначе (или если окно закрыли) — инструкция.
    if (state === "available" && (await promptInstall())) return;
    setGuideOpen(true);
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={base}>
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
      {guideOpen && <InstallGuide locale={locale} onClose={() => setGuideOpen(false)} />}
    </>
  );
}
