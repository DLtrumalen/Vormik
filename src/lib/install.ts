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
  | "unknown"
  /** Открыто как установленное приложение. */
  | "installed"
  /** Браузер готов показать системное окно установки. */
  | "available"
  /** Браузер не может установить приложение (пока или вообще). */
  | "unavailable";

const EVENT = "vormik:install";

/** Открыто ли как установленное приложение (на iOS это отдельный флаг navigator.standalone). */
export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function snapshot(): InstallState {
  if (window.__vormikInstalled || isStandalone()) return "installed";
  if (window.__vormikInstallPrompt) return "available";
  return "unavailable";
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function useInstallState() {
  return useSyncExternalStore(subscribe, snapshot, () => "unknown" as const);
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
  window.dispatchEvent(new Event(EVENT));
  return outcome === "accepted";
}
