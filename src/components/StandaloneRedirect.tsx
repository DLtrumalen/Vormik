"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isStandalone } from "@/lib/install";

/**
 * iPhone запоминает страницу, с которой приложение добавили на главный экран, — обычно это сайт.
 * Если сайт открыт как установленное приложение, сразу переходим в тренажёр.
 * Ссылка «О приложении» из тренажёра добавляет ?about, чтобы сайт всё-таки можно было посмотреть.
 */
export function StandaloneRedirect() {
  const router = useRouter();
  useEffect(() => {
    const about = new URLSearchParams(window.location.search).has("about");
    if (isStandalone() && !about) router.replace("/train");
  }, [router]);
  return null;
}
