"use client";

import dynamic from "next/dynamic";

// Прогресс хранится в браузере, поэтому тренажёр рендерится только на клиенте.
const Trainer = dynamic(() => import("./Trainer"), {
  ssr: false,
  loading: () => (
    <div className="app-theme fixed inset-0 grid place-items-center">
      <span
        aria-label="Vormik"
        className="grid size-16 animate-pulse place-items-center rounded-2xl bg-brand text-3xl text-white"
      >
        õ
      </span>
    </div>
  ),
});

export function TrainerLoader() {
  return <Trainer />;
}
