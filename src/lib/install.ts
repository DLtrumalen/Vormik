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
}

export type InstallState =
  /** Ещё на сервере или до первой отрисовки. */
  | { kind: "unknown" }
  /** Открыто как установленное приложение. */
  | { kind: "installed" }
  /** Chrome готов показать окно установки. */
  | { kind: "available" }
  /**
   * iPhone/iPad: Apple не даёт сайтам открыть окно установки, только «Поделиться» → «На экран „Домой“».
   * browser — где открыт сайт: в Safari кнопка «Поделиться» внизу, в Chrome/Edge — в адресной строке,
   * а во встроенных браузерах (Instagram, Facebook) такого пункта нет вовсе.
   */
  | { kind: "ios"; browser: "safari" | "other" | "in-app" }
  /** Chrome/Edge, но окно установки сейчас недоступно (уже установлено или пользователь закрыл окно). */
  | { kind: "chromium" }
  /** Firefox, Safari на Mac и прочие. */
  | { kind: "manual" };

const EVENT = "vormik:install";

let cached: InstallState = { kind: "unknown" };

/** Открыто ли как установленное приложение (на iOS это отдельный флаг navigator.standalone). */
export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  // iPadOS выдаёт себя за Mac, но у Mac нет сенсорного экрана.
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function iosBrowser(): "safari" | "other" | "in-app" {
  const ua = navigator.userAgent;
  if (/Instagram|FBAN|FBAV|Line\/|Snapchat|TikTok|musical_ly/.test(ua)) return "in-app";
  if (/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua)) return "other";
  return "safari";
}

function compute(): InstallState {
  if (window.__vormikInstalled || isStandalone()) return { kind: "installed" };
  if (window.__vormikInstallPrompt) return { kind: "available" };
  if (isIOS()) return { kind: "ios", browser: iosBrowser() };
  if ("BeforeInstallPromptEvent" in window) return { kind: "chromium" };
  return { kind: "manual" };
}

function snapshot(): InstallState {
  const next = compute();
  if (JSON.stringify(next) !== JSON.stringify(cached)) cached = next;
  return cached;
}

const serverSnapshot: InstallState = { kind: "unknown" };

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function useInstallState() {
  return useSyncExternalStore(subscribe, snapshot, () => serverSnapshot);
}

/** Показывает системное окно установки Chrome. Возвращает true, если пользователь согласился. */
export async function promptInstall() {
  const event = window.__vormikInstallPrompt;
  if (!event) return false;
  // Событие можно использовать только один раз.
  window.__vormikInstallPrompt = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") window.__vormikInstalled = true;
  window.dispatchEvent(new Event(EVENT));
  return outcome === "accepted";
}
