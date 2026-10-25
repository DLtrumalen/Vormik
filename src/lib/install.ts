"use client";

import { useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallState =
  | { kind: "unknown" }
  | { kind: "installed" }
  | { kind: "available" }
  | { kind: "ios" }
  | { kind: "manual" };

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

// Браузер присылает событие один раз вскоре после загрузки, поэтому ловим его сразу при импорте модуля.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    notify();
  });
}

let cached: InstallState = { kind: "unknown" };

function snapshot(): InstallState {
  let next: InstallState;
  if (installed || window.matchMedia("(display-mode: standalone)").matches) {
    next = { kind: "installed" };
  } else if (deferred) {
    next = { kind: "available" };
  } else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    next = { kind: "ios" };
  } else {
    next = { kind: "manual" };
  }
  if (next.kind !== cached.kind) cached = next;
  return cached;
}

const serverSnapshot: InstallState = { kind: "unknown" };

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInstallState() {
  return useSyncExternalStore(subscribe, snapshot, () => serverSnapshot);
}

/** Показывает системное окно установки. Возвращает true, если пользователь согласился. */
export async function promptInstall() {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") installed = true;
  notify();
  return outcome === "accepted";
}
