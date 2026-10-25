"use client";

import { useEffect } from "react";

/** Регистрирует service worker, чтобы приложение открывалось без интернета. В режиме разработки не нужен. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Без service worker всё работает, просто не офлайн.
    });
  }, []);

  return null;
}
