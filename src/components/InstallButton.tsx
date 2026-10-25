"use client";

import Link from "next/link";
import { useState } from "react";
import { promptInstall, useInstallState } from "@/lib/install";

type Props = { size?: "md" | "lg"; tone?: "brand" | "light" };

export function InstallButton({ size = "md", tone = "brand" }: Props) {
  const state = useInstallState();
  const [showHelp, setShowHelp] = useState(false);

  const sizing = size === "lg" ? "h-13 px-7 text-base rounded-2xl" : "h-11 px-5 text-sm rounded-xl";
  const colors =
    tone === "light"
      ? "bg-white text-brand hover:bg-white/90 focus-visible:outline-white"
      : "bg-brand text-white hover:bg-brand-strong focus-visible:outline-brand";
  const base = `${sizing} ${colors} inline-flex items-center justify-center gap-2 font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2`;

  if (state.kind === "installed") {
    return (
      <div className="flex flex-col items-start gap-2">
        <Link href="/train" className={base}>
          Открыть тренажёр
        </Link>
        <p className={`text-sm ${tone === "light" ? "text-white/80" : "text-muted"}`}>
          Приложение уже установлено.
        </p>
      </div>
    );
  }

  async function handleClick() {
    if (state.kind === "available") {
      await promptInstall();
      return;
    }
    setShowHelp((v) => !v);
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button type="button" onClick={handleClick} className={base} aria-expanded={showHelp}>
        <DownloadIcon />
        Скачать приложение
      </button>
      {showHelp && (
        <div className="max-w-sm rounded-xl border border-line bg-surface p-4 text-left text-sm leading-relaxed text-muted">
          {state.kind === "ios" ? (
            <p>
              На iPhone и iPad: нажмите <b className="text-foreground">«Поделиться»</b> внизу экрана
              Safari, затем <b className="text-foreground">«На экран „Домой“»</b>.
            </p>
          ) : (
            <p>
              Откройте сайт в <b className="text-foreground">Chrome</b> или{" "}
              <b className="text-foreground">Edge</b> и нажмите значок установки в адресной строке.
              На Android — меню ⋮ → <b className="text-foreground">«Установить приложение»</b>.
            </p>
          )}
          <p className="mt-2">
            Или{" "}
            <Link
              href="/train"
              className="font-medium text-brand underline-offset-2 hover:underline"
            >
              занимайтесь прямо в браузере
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
