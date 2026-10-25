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
  /** Chrome готов показать системное окно установки. */
  | "available"
  /** Окна установки нет — показываем инструкцию. */
  | "guide";

export type Device = {
  os: "android" | "ios" | "desktop";
  browser: "chrome" | "edge" | "samsung" | "safari" | "other";
  /** Встроенный браузер Telegram, Instagram и т. п. — из него установить приложение нельзя. */
  inApp: boolean;
};

const EVENT = "vormik:install";

/** Определяет устройство и браузер по строке User-Agent. */
export function detectDevice(ua: string, platform = "", maxTouchPoints = 0): Device {
  // iPadOS выдаёт себя за Mac, но у Mac нет сенсорного экрана.
  const ios = /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const inApp =
    /Telegram|Instagram|FBAN|FBAV|FB_IAB|Line\/|Snapchat|TikTok|musical_ly|VKClient|Viber/.test(
      ua,
    ) ||
    (android && /; wv\)/.test(ua));

  let browser: Device["browser"] = "other";
  if (/SamsungBrowser/.test(ua)) browser = "samsung";
  else if (/EdgA?\/|EdgiOS/.test(ua)) browser = "edge";
  else if (/OPR\/|OPiOS|YaBrowser|Firefox|FxiOS/.test(ua)) browser = "other";
  else if (/CriOS|Chrome\//.test(ua)) browser = "chrome";
  else if (/Safari\//.test(ua)) browser = "safari";

  return { os: ios ? "ios" : android ? "android" : "desktop", browser, inApp };
}

export function currentDevice() {
  return detectDevice(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
}

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
  return "guide";
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function useInstallState() {
  return useSyncExternalStore(subscribe, snapshot, () => "unknown" as const);
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

/** Ссылка, которая на Android открывает страницу в Chrome из встроенного браузера (Telegram и т. п.). */
export function openInChromeUrl(url: string) {
  const { host, pathname, search } = new URL(url);
  return `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
}
