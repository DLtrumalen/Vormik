"use client";

import Link from "next/link";
import { localeHref, type Dictionary } from "@/i18n";
import type { Settings } from "@/lib/srs";
import { CasePickerFields } from "./CasePicker";

type Props = { t: Dictionary; settings: Settings; onChange: (settings: Settings) => void };

export function SettingsView({ t, settings, onChange }: Props) {
  return (
    <section className="space-y-5 rounded-[1.75rem] bg-surface p-5 shadow-xl shadow-black/20">
      <div>
        <h1 className="text-xl font-semibold">{t.settings.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.settings.lead}</p>
      </div>

      <CasePickerFields t={t} settings={settings} onChange={onChange} />

      <p className="border-t border-line pt-4 text-sm text-muted">
        {t.settings.footer}{" "}
        <Link
          href={`${localeHref(t.locale)}?about`}
          className="font-medium text-brand underline-offset-2 hover:underline"
        >
          {t.settings.about}
        </Link>
      </p>
    </section>
  );
}
