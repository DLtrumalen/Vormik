"use client";

import { useEffect } from "react";
import { isStoreApp } from "@/lib/install";

/**
 * Регистрирует service worker, чтобы приложение открывалось без интернета.
 * В режиме разработки, наоборот, удаляет его: иначе он подсовывает файлы старой сборки с того же адреса.
 */
export function ServiceWorker() {
  useEffect(() => {
    // В приложении из магазина все файлы и так внутри: service worker только мешал бы обновлениям.
    if (!("serviceWorker" in navigator) || isStoreApp()) return;

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

    // Когда новая версия service worker берёт управление, перезагружаем страницу, чтобы сразу показать
    // свежую версию. При самой первой установке управления ещё не было — тогда перезагрузка не нужна.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;
    const onControllerChange = () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let registration: ServiceWorkerRegistration | undefined;
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") registration?.update().catch(() => {});
    };
    document.addEventListener("visibilitychange", checkForUpdate);

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
        return navigator.serviceWorker.ready;
      })
      .then((ready) => {
        // Файлы, загруженные ещё до service worker, иначе не попадут в кэш, и без интернета
        // приложение откроется пустым.
        const urls = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => new URL(url).pathname.startsWith("/_next/static/"));
        ready.active?.postMessage({ type: "cache", urls });
      })
      .catch(() => {
        // Без service worker всё работает, просто не офлайн.
      });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  return null;
}
