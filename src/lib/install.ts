"use client";

import { useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __vormikInstallPrompt?: BeforeInstallPromptEvent | null;
    __vormikInstalled?: boolean;
  }
  interface Navigator {
    getInstalledRelatedApps?: () => Promise<{ platform: string; url?: string }[]>;
  }
}

export type InstallState =
  /** Ещё на сервере или до первой отрисовки. */
  | "unknown"
  /** Приложение установлено: открыто как приложение или браузер сообщил, что оно уже стоит. */
  | "installed"
  /** Браузер готов показать системное окно установки. */
  | "available"
  /** Браузер пока не прислал разрешение на установку. */
  | "waiting";

const EVENT = "vormik:install";

function notify() {
  window.dispatchEvent(new Event(EVENT));
}

/** Открыто ли в настольном приложении Vormik для Windows (оно добавляет метку в User-Agent). */
export function isDesktopApp() {
  return navigator.userAgent.includes("VormikDesktop");
}

/** Открыто ли как установленное приложение (на iOS это отдельный флаг navigator.standalone). */
export function isStandalone() {
  return (
    isDesktopApp() ||
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Компьютер с Windows, на который можно поставить настольное приложение. */
export function isWindowsDesktop() {
  return /Windows NT/.test(navigator.userAgent) && !isDesktopApp();
}

/** Установщик настольного приложения для Windows: последний выпуск в публичном репозитории vormik-releases. */
export const DESKTOP_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_URL ??
  "https://github.com/DLtrumalen/vormik-releases/releases/latest/download/Vormik-Setup.exe";

const noSubscribe = () => () => {};

export function useIsWindowsDesktop() {
  return useSyncExternalStore(noSubscribe, isWindowsDesktop, () => false);
}

// Если приложение уже установлено, Chrome не присылает beforeinstallprompt — спрашиваем напрямую.
if (typeof window !== "undefined" && navigator.getInstalledRelatedApps) {
  navigator
    .getInstalledRelatedApps()
    .then((apps) => {
      if (apps.length > 0) {
        window.__vormikInstalled = true;
        notify();
      }
    })
    .catch(() => {});
}

function snapshot(): InstallState {
  if (window.__vormikInstalled || isStandalone()) return "installed";
  if (window.__vormikInstallPrompt) return "available";
  return "waiting";
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function useInstallState() {
  return useSyncExternalStore(subscribe, snapshot, () => "unknown" as const);
}

/** Ждёт, пока браузер разрешит установку (нажатие на странице часто и есть недостающее условие). */
export function waitForInstallPrompt(timeoutMs: number): Promise<boolean> {
  if (window.__vormikInstallPrompt) return Promise.resolve(true);
  return new Promise((resolve) => {
    const done = (ok: boolean) => {
      window.removeEventListener(EVENT, onEvent);
      clearTimeout(timer);
      resolve(ok);
    };
    const onEvent = () => {
      if (window.__vormikInstallPrompt) done(true);
    };
    const timer = setTimeout(() => done(false), timeoutMs);
    window.addEventListener(EVENT, onEvent);
  });
}

/** Показывает системное окно установки. Возвращает true, если пользователь согласился. */
export async function promptInstall() {
  const event = window.__vormikInstallPrompt;
  if (!event) return false;
  // Событие можно использовать только один раз.
  window.__vormikInstallPrompt = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") window.__vormikInstalled = true;
  notify();
  return outcome === "accepted";
}
