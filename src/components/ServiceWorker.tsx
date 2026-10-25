"use client";

import { useEffect } from "react";

/**
 * Регистрирует service worker, чтобы приложение открывалось без интернета.
 * В режиме разработки, наоборот, удаляет его: иначе он подсовывает файлы старой сборки с того же адреса.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
        .then((removed) => {
          if (!removed.some(Boolean)) return;
          return caches
            .keys()
            .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
            .then(() => window.location.reload());
        })
        .catch(() => {});
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Без service worker всё работает, просто не офлайн.
    });
  }, []);

  return null;
}
