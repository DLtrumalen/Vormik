"use client";

import Link from "next/link";
import type { Settings } from "@/lib/srs";
import { CasePickerFields } from "./CasePicker";

type Props = { settings: Settings; onChange: (settings: Settings) => void };

export function SettingsView({ settings, onChange }: Props) {
  return (
    <section className="space-y-5 rounded-[1.75rem] bg-surface p-5 shadow-xl shadow-black/20">
      <div>
        <h1 className="text-xl font-semibold">Что тренировать</h1>
        <p className="mt-1 text-sm text-muted">
          Выберите падежи и число. Задания будут только из выбранного.
        </p>
      </div>

      <CasePickerFields settings={settings} onChange={onChange} />

      <p className="border-t border-line pt-4 text-sm text-muted">
        Vormik — тренажёр эстонских падежей.{" "}
        <Link href="/" className="font-medium text-brand underline-offset-2 hover:underline">
          О приложении
        </Link>
      </p>
    </section>
  );
}
