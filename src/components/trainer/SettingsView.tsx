"use client";

import Link from "next/link";
import { localeHref, type Dictionary } from "@/i18n";
import type { Settings } from "@/lib/srs";
import { saveTheme, useTheme, type Theme } from "@/lib/theme";
import { privacyHref, privacyTitle } from "@/components/PrivacyPolicy";
import { CasePickerFields } from "./CasePicker";

type Props = { t: Dictionary; settings: Settings; onChange: (settings: Settings) => void };

const THEMES: Theme[] = ["dark", "light"];

export function SettingsView({ t, settings, onChange }: Props) {
  const current = useTheme();

  return (
    <section className="space-y-5 rounded-[1.75rem] bg-surface p-5 shadow-xl shadow-black/20">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t.settings.theme}</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-raised p-1 text-sm">
          {THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              aria-pressed={current === theme}
              onClick={() => saveTheme(theme)}
              className={`rounded-lg px-2 py-2 font-medium transition-colors ${
                current === theme
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.settings.themes[theme]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="border-t border-line pt-5">
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
        {" · "}
        <Link
          href={privacyHref(t.locale)}
          className="font-medium text-brand underline-offset-2 hover:underline"
        >
          {privacyTitle(t.locale)}
        </Link>
      </p>
    </section>
  );
}
