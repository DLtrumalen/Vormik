"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  currentDevice,
  openInChromeUrl,
  promptInstall,
  useInstallState,
  type Device,
} from "@/lib/install";

type Tab = Device["os"];

const TABS: { key: Tab; label: string }[] = [
  { key: "android", label: "Android" },
  { key: "ios", label: "iPhone" },
  { key: "desktop", label: "Компьютер" },
];

/** Единственная инструкция по установке: сама выбирает устройство, шаги — для него. */
export function InstallGuide({ onClose }: { onClose: () => void }) {
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
      // Буфер обмена недоступен — ссылка всё равно видна в шаге 1.
    }
  }

  const host = typeof window === "undefined" ? "" : window.location.host;
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
                Установка Vormik
              </h2>
              <p className="text-sm text-muted">Бесплатно, 3 шага, без магазина приложений</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-raised text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl bg-surface-raised p-1 text-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`rounded-lg px-2 py-2 font-medium transition-colors ${
                tab === t.key ? "bg-surface text-foreground shadow-sm" : "text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {state === "available" && tab !== "ios" && (
          <button
            type="button"
            onClick={install}
            className="mt-5 h-13 w-full rounded-2xl bg-brand font-semibold text-white hover:bg-brand-strong"
          >
            Установить сейчас
          </button>
        )}

        {here && device.inApp && <InAppWarning os={device.os} />}

        <ol className="mt-5 space-y-4">
          {tab === "android" && (
            <>
              <Step n={1}>
                Откройте <b>{host}</b> в браузере <b>Chrome</b>.
              </Step>
              <Step n={2}>
                Нажмите <Key>⋮</Key> — три точки в правом верхнем углу.
              </Step>
              <Step n={3}>
                Выберите <b>«Установить приложение»</b> (или <b>«Добавить на главный экран»</b>) и
                подтвердите <b>«Установить»</b>.
              </Step>
            </>
          )}
          {tab === "ios" && (
            <>
              <Step n={1}>
                Откройте <b>{host}</b> в <b>Safari</b> (подойдёт и Chrome).
              </Step>
              <Step n={2}>
                Нажмите <ShareIcon /> <b>«Поделиться»</b>: в Safari — внизу экрана (в iOS 26 сначала{" "}
                <Key>•••</Key>), в Chrome — справа в адресной строке.
              </Step>
              <Step n={3}>
                Выберите <PlusSquareIcon /> <b>«На экран „Домой“»</b> и нажмите <b>«Добавить»</b>.
              </Step>
            </>
          )}
          {tab === "desktop" && (
            <>
              <Step n={1}>
                Откройте <b>{host}</b> в <b>Chrome</b> или <b>Edge</b>.
              </Step>
              <Step n={2}>
                Нажмите значок <InstallIcon /> в правом конце адресной строки. Если его нет — меню{" "}
                <Key>⋮</Key> → <b>«Трансляция, сохранение и отправка»</b> →{" "}
                <b>«Установить страницу как приложение»</b>.
              </Step>
              <Step n={3}>
                Нажмите <b>«Установить»</b>.
              </Step>
            </>
          )}
        </ol>

        <p className="mt-5 rounded-2xl bg-success-soft px-4 py-3 text-sm text-success">
          Готово: значок Vormik появится{" "}
          {tab === "desktop" ? "в меню «Пуск» и на панели задач" : "на главном экране"} и будет
          открываться как отдельное приложение, даже без интернета.
        </p>

        <button
          type="button"
          onClick={copyLink}
          className="mt-4 h-11 w-full rounded-xl border border-line text-sm font-medium hover:border-brand hover:text-brand"
        >
          {copied ? "Ссылка скопирована ✓" : "Скопировать ссылку на сайт"}
        </button>
      </div>
    </div>
  );
}

function InAppWarning({ os }: { os: Tab }) {
  return (
    <div className="mt-5 rounded-2xl bg-warning-soft p-4 text-sm text-warning">
      <p className="font-semibold">Сначала откройте сайт в браузере</p>
      <p className="mt-1 text-foreground/80">
        Ссылка открылась внутри другого приложения (Telegram, Instagram…) — оттуда установить
        нельзя.
        {os === "ios" ? (
          <>
            {" "}
            Нажмите <Key>•••</Key> или значок компаса и выберите <b>«Открыть в Safari»</b>.
          </>
        ) : (
          <> Нажмите кнопку ниже или ⋮ → «Открыть в браузере».</>
        )}
      </p>
      {os === "android" && (
        <a
          href={openInChromeUrl(window.location.href)}
          className="mt-3 flex h-11 items-center justify-center rounded-xl bg-brand font-semibold text-white"
        >
          Открыть в Chrome
        </a>
      )}
    </div>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[15px] leading-relaxed">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">
        {n}
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-line bg-surface-raised px-1.5 py-0.5 font-sans text-sm font-semibold">
      {children}
    </kbd>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      className="inline-block align-[-4px] text-brand"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ShareIcon() {
  return (
    <Svg>
      <path
        d="M12 15V3m0 0L8 7m4-4 4 4M7 10H5v11h14V10h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusSquareIcon() {
  return (
    <Svg>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function InstallIcon() {
  return (
    <Svg>
      <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7.5v6m0 0-2.5-2.5M12 13.5l2.5-2.5M8 20h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
