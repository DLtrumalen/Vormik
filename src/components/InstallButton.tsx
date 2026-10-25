"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDictionary, type Locale } from "@/i18n";
import {
  DESKTOP_DOWNLOAD_URL,
  promptInstall,
  useInstallState,
  useIsWindowsDesktop,
  waitForInstallPrompt,
} from "@/lib/install";

type Props = { locale: Locale; size?: "md" | "lg" };

/** Сколько ждать разрешения на установку после нажатия: Chrome часто даёт его именно после клика. */
const WAIT_AFTER_CLICK_MS = 4000;

/**
 * Кнопка установки без подсказок:
 * Windows — скачивается настольное приложение (установщик .exe);
 * остальные — системное окно установки браузера, а если его нет — открываем тренажёр.
 */
export function InstallButton({ locale, size = "md" }: Props) {
  const t = getDictionary(locale).install;
  const state = useInstallState();
  const windows = useIsWindowsDesktop();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (windows) {
      window.location.href = DESKTOP_DOWNLOAD_URL;
      return;
    }
    if (state === "installed") {
      router.push("/train");
      return;
    }
    setBusy(true);
    try {
      if (await waitForInstallPrompt(WAIT_AFTER_CLICK_MS)) {
        await promptInstall();
        return;
      }
      router.push("/train");
    } finally {
      setBusy(false);
    }
  }

  const sizing = size === "lg" ? "h-13 px-7 text-base rounded-2xl" : "h-11 px-5 text-sm rounded-xl";
  const label = windows ? t.downloadWindows : state === "installed" ? t.openTrainer : t.download;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
      className={`${sizing} inline-flex items-center justify-center gap-2 bg-brand font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-80`}
    >
      {busy ? (
        <span
          aria-hidden="true"
          className="size-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  );
}
