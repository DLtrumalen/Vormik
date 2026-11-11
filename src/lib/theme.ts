"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY as KEY } from "./theme-script";

export { LIGHT_CLASS } from "./theme-script";

export type Theme = "dark" | "light";

const EVENT = "vormik:theme";

function readTheme(): Theme {
  try {
    if (window.localStorage.getItem(KEY) === "light") return "light";
  } catch {
    // Хранилище недоступно — тема по умолчанию.
  }
  return "dark";
}

export function saveTheme(theme: Theme) {
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // Хранилище недоступно — тема продержится до перезагрузки.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/** Тема тренажёра: тёмная (по умолчанию) или светлая. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => "dark" as const);
}

/** Цвет системной строки браузера/телефона под тему приложения. */
export const THEME_COLOR = { dark: "#0b1220", light: "#eef2f7" } as const;
