"use client";

import { useSyncExternalStore } from "react";
import { isLocale, type Locale } from "./index";

const KEY = "vormik:locale";
const EVENT = "vormik:locale";

/** Сохранённый язык или null, если пользователь его ещё не выбирал. */
export function readSavedLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveLocale(locale: Locale) {
  try {
    window.localStorage.setItem(KEY, locale);
  } catch {
    // Хранилище недоступно — язык продержится до перезагрузки.
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

/** Язык приложения: выбранный пользователем, по умолчанию — русский. */
export function useLocale(): Locale {
  return useSyncExternalStore(
    subscribe,
    () => readSavedLocale() ?? "ru",
    () => "ru",
  );
}
