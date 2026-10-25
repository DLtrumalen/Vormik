"use client";

import Link from "next/link";
import { useState } from "react";
import { promptInstall, useInstallState } from "@/lib/install";

type Props = { size?: "md" | "lg"; tone?: "brand" | "light" };

export function InstallButton({ size = "md", tone = "brand" }: Props) {
  const state = useInstallState();
  const [showHelp, setShowHelp] = useState(false);

  const sizing = size === "lg" ? "h-13 px-7 text-base rounded-2xl" : "h-11 px-5 text-sm rounded-xl";
  const colors =
    tone === "light"
      ? "bg-white text-brand hover:bg-white/90 focus-visible:outline-white"
      : "bg-brand text-white hover:bg-brand-strong focus-visible:outline-brand";
  const base = `${sizing} ${colors} inline-flex items-center justify-center gap-2 font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2`;

  if (state.kind === "installed") {
    return (
      <div className="flex flex-col items-start gap-2">
        <Link href="/train" className={base}>
          Открыть тренажёр
        </Link>
        <p className={`text-sm ${tone === "light" ? "text-white/80" : "text-muted"}`}>
          Приложение уже установлено.
        </p>
      </div>
    );
  }

  async function handleClick() {
    if (state.kind === "available") {
      const accepted = await promptInstall();
      // Пользователь закрыл окно — показываем, как установить вручную.
      if (!accepted) setShowHelp(true);
      return;
    }
    setShowHelp((v) => !v);
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button type="button" onClick={handleClick} className={base} aria-expanded={showHelp}>
        <DownloadIcon />
        Скачать приложение
      </button>
      {showHelp && (
        <div className="max-w-sm rounded-xl border border-line bg-surface p-4 text-left text-sm leading-relaxed text-muted">
          {state.kind === "ios" ? (
            <IosSteps browser={state.browser} />
          ) : state.kind === "chromium" ? (
            <>
              <p>
                <b className="text-foreground">На компьютере:</b> значок установки справа в адресной
                строке (монитор со стрелкой) или меню ⋮ →{" "}
                <b className="text-foreground">«Трансляция, сохранение и отправка»</b> →{" "}
                <b className="text-foreground">«Установить страницу как приложение»</b>.
              </p>
              <p className="mt-2">
                <b className="text-foreground">На Android:</b> меню ⋮ →{" "}
                <b className="text-foreground">«Установить приложение»</b> или{" "}
                <b className="text-foreground">«Добавить на главный экран»</b>.
              </p>
              <p className="mt-2">
                Если пункта нет — приложение, скорее всего, уже установлено: найдите Vormik среди
                приложений.
              </p>
            </>
          ) : (
            <p>
              Этот браузер не умеет устанавливать приложения. Откройте сайт в{" "}
              <b className="text-foreground">Chrome</b> или <b className="text-foreground">Edge</b>,
              а на iPhone — в <b className="text-foreground">Safari</b>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Apple не даёт сайтам открыть окно установки — показываем, где нажать. */
function IosSteps({ browser }: { browser: "safari" | "other" | "in-app" }) {
  if (browser === "in-app") {
    return (
      <p>
        Сейчас сайт открыт внутри другого приложения, отсюда установить нельзя. Нажмите{" "}
        <b className="text-foreground">•••</b> и выберите{" "}
        <b className="text-foreground">«Открыть в Safari»</b>, затем нажмите «Скачать приложение»
        ещё раз.
      </p>
    );
  }
  const shareWhere =
    browser === "safari"
      ? "внизу экрана (в новых iOS — сначала «•••» справа внизу)"
      : "справа в адресной строке";
  return (
    <>
      <p className="font-semibold text-foreground">Установка на iPhone и iPad</p>
      <ol className="mt-2 space-y-2.5">
        <Step n={1}>
          Нажмите <ShareIcon /> <b className="text-foreground">«Поделиться»</b> {shareWhere}.
        </Step>
        <Step n={2}>
          Пролистайте вниз и выберите <PlusSquareIcon />{" "}
          <b className="text-foreground">«На экран „Домой“»</b>.
        </Step>
        <Step n={3}>
          Нажмите <b className="text-foreground">«Добавить»</b> — значок Vormik появится на главном
          экране и будет открываться как отдельное приложение.
        </Step>
      </ol>
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

function ShareIcon() {
  return (
    <svg
      className="inline-block align-[-3px] text-brand"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 15V3m0 0L8 7m4-4 4 4M7 10H5v11h14V10h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg
      className="inline-block align-[-3px] text-brand"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
