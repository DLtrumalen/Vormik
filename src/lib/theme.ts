"use client";

import { useSyncExternalStore } from "react";

export type ThemePreference = "dark" | "light" | "system";

const KEY = "vormik:theme";
const EVENT = "vormik:theme";
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

function readPreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === "dark" || value === "light" || value === "system") return value;
  } catch {
    // Хранилище недоступно — тема по умолчанию.
  }
  return "dark";
}

export function saveThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(KEY, preference);
  } catch {
    // Хранилище недоступно — тема продержится до перезагрузки.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(listener: () => void) {
  const media = window.matchMedia(SYSTEM_DARK);
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  media.addEventListener("change", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
    media.removeEventListener("change", listener);
  };
}

/** Выбор пользователя: тёмная, светлая или как в системе. По умолчанию — тёмная. */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, readPreference, () => "dark" as const);
}

/** Тема, которая сейчас применяется («как в системе» превращается в тёмную или светлую). */
export function useResolvedTheme(): "dark" | "light" {
  return useSyncExternalStore(
    subscribe,
    () => {
      const preference = readPreference();
      if (preference !== "system") return preference;
      return window.matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
    },
    () => "dark" as const,
  );
}

/** Цвет системной строки браузера/телефона под тему приложения. */
export const THEME_COLOR = { dark: "#0b1220", light: "#eef2f7" } as const;
