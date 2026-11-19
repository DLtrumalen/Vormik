"use client";

import { Component, type ReactNode } from "react";
import { getDictionary } from "@/i18n";
import { readSavedLocale } from "@/i18n/client";
import { resetProgress } from "@/lib/storage";

/**
 * Если тренажёр упал (например, из-за испорченного прогресса), показываем понятный экран с кнопкой
 * сброса. Без него кнопка «Сбросить прогресс» оказалась бы внутри сломанного экрана, и выхода не было бы.
 */
export class TrainerErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const t = getDictionary(readSavedLocale() ?? "ru").app.crash;
    return (
      <div className="app-theme fixed inset-0 grid place-items-center px-6">
        <div className="max-w-sm text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand text-3xl text-white"
          >
            õ
          </span>
          <h1 className="mt-6 text-2xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-muted">{t.text}</p>
          <button
            type="button"
            onClick={() => {
              resetProgress();
              window.location.reload();
            }}
            className="mt-6 h-12 w-full rounded-2xl bg-brand px-4 font-semibold text-white"
          >
            {t.reset}
          </button>
        </div>
      </div>
    );
  }
}
