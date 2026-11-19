"use client";

import { useEffect } from "react";
import { isStoreApp } from "@/lib/install";

/** Событие «Назад»: экран, который сам обработал кнопку (закрыл окно, сменил вкладку), отменяет его. */
export const BACK_EVENT = "vormik:back";

/**
 * Системная кнопка «Назад» в приложении для Android. Без обработчика она сразу закрывает приложение,
 * даже со страницы политики или вкладки «Прогресс». Теперь сначала её обрабатывает открытый экран,
 * потом — история переходов, и только на главном экране она закрывает приложение.
 */
export function NativeBack() {
  useEffect(() => {
    if (!isStoreApp()) return;
    let remove: (() => void) | undefined;
    let cancelled = false;
    import("@capacitor/app").then(({ App }) =>
      App.addListener("backButton", ({ canGoBack }) => {
        const event = new Event(BACK_EVENT, { cancelable: true });
        if (!window.dispatchEvent(event)) return;
        if (canGoBack) window.history.back();
        else App.exitApp();
      }).then((handle) => {
        if (cancelled) handle.remove();
        else remove = () => handle.remove();
      }),
    );
    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);

  return null;
}
