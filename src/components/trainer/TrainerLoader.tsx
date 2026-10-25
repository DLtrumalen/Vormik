"use client";

import dynamic from "next/dynamic";

// Прогресс хранится в браузере, поэтому тренажёр рендерится только на клиенте.
const Trainer = dynamic(() => import("./Trainer"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-dvh items-center justify-center text-muted">Загружаем тренажёр…</div>
  ),
});

export function TrainerLoader() {
  return <Trainer />;
}
