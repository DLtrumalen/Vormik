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
  /** iPhone/iPad: установка только через «Поделиться». */
  | { kind: "ios" }
  /** Chrome/Edge, но окно установки сейчас недоступно (уже установлено или пользователь закрыл окно). */
  | { kind: "chromium" }
  /** Firefox, Safari на Mac и прочие. */
  | { kind: "manual" };

const EVENT = "vormik:install";

let cached: InstallState = { kind: "unknown" };

function compute(): InstallState {
  if (window.__vormikInstalled || window.matchMedia("(display-mode: standalone)").matches) {
    return { kind: "installed" };
  }
  if (window.__vormikInstallPrompt) return { kind: "available" };
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return { kind: "ios" };
  if ("BeforeInstallPromptEvent" in window) return { kind: "chromium" };
  return { kind: "manual" };
}

function snapshot(): InstallState {
  const next = compute();
  if (next.kind !== cached.kind) cached = next;
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
