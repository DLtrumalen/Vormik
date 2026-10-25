"use client";

import { useEffect, useRef, useState } from "react";
import { getDictionary, type Locale } from "@/i18n";
import {
  currentDevice,
  openInChromeUrl,
  promptInstall,
  useInstallState,
  type Device,
} from "@/lib/install";
import { Rich } from "./Rich";

type Tab = Device["os"];

const TAB_ORDER: Tab[] = ["android", "ios", "desktop"];

/** Единственная инструкция по установке: сама выбирает устройство, шаги — для него. */
export function InstallGuide({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const t = getDictionary(locale).install;
  const state = useInstallState();
  const [device] = useState(currentDevice);
  const [tab, setTab] = useState<Tab>(device.os);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function install() {
    if (await promptInstall()) onClose();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
    } catch {
      // Буфер обмена недоступен — адрес всё равно виден в шаге 1.
    }
  }

  const vars = { host: window.location.host };
  const here = tab === device.os;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 text-left text-foreground shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-xl bg-brand text-2xl text-white"
            >
              õ
            </span>
            <div>
              <h2 id="install-title" className="text-lg font-semibold">
                {t.title}
              </h2>
              <p className="text-sm text-muted">{t.subtitle}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-raised text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-surface-raised p-1 text-sm">
          {TAB_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`rounded-lg px-2 py-2 font-medium transition-colors ${
                tab === key ? "bg-surface text-foreground shadow-sm" : "text-muted"
              }`}
            >
              {t.tabs[key]}
            </button>
          ))}
        </div>

        {state === "available" && tab !== "ios" && (
          <button
            type="button"
            onClick={install}
            className="mt-5 h-13 w-full rounded-2xl bg-brand font-semibold text-white hover:bg-brand-strong"
          >
            {t.installNow}
          </button>
        )}

        {here && device.inApp && (
          <div className="mt-5 rounded-2xl bg-warning-soft p-4 text-sm text-warning">
            <p className="font-semibold">{t.inAppTitle}</p>
            <p className="mt-1 text-foreground/80">
              {t.inAppText} <Rich text={device.os === "ios" ? t.inAppIos : t.inAppAndroid} />
            </p>
            {device.os === "android" && (
              <a
                href={openInChromeUrl(window.location.href)}
                className="mt-3 flex h-11 items-center justify-center rounded-xl bg-brand font-semibold text-white"
              >
                {t.openInChrome}
              </a>
            )}
          </div>
        )}

        <ol className="mt-5 space-y-4">
          {t.steps[tab].map((step, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-muted">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">
                <Rich text={step} vars={vars} />
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-5 rounded-2xl bg-success-soft px-4 py-3 text-sm text-success">
          {tab === "desktop" ? t.doneDesktop : t.doneMobile}
        </p>

        <button
          type="button"
          onClick={copyLink}
          className="mt-4 h-11 w-full rounded-xl border border-line text-sm font-medium hover:border-brand hover:text-brand"
        >
          {copied ? t.copied : t.copy}
        </button>
      </div>
    </div>
  );
}
