// Сборка тренажёра для приложения в магазинах (Capacitor): статичные файлы в out/, без сервера.
//
// Манифест и иконки сайта (manifest.ts, icon.tsx, apple-icon.tsx) — серверные маршруты, в статичной
// сборке они не собираются, а приложению и не нужны: иконки у него свои. На время сборки
// эти файлы откладываются в сторону и потом возвращаются на место.
//
// Запуск: npm run build:app, затем npx cap sync android.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, renameSync, rmSync } from "node:fs";

const SITE_ONLY = ["src/app/manifest.ts", "src/app/icon.tsx", "src/app/apple-icon.tsx"];
const aside = (file) => `${file}.site-only`;

for (const file of SITE_ONLY) renameSync(file, aside(file));
try {
  rmSync("out", { recursive: true, force: true });
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, VORMIK_APP: "1" } });
} finally {
  for (const file of SITE_ONLY) if (existsSync(aside(file))) renameSync(aside(file), file);
}

// Приложение сразу открывает тренажёр, а не страницу сайта. Service worker ему не нужен:
// все файлы и так лежат внутри приложения.
copyFileSync("out/train.html", "out/index.html");
rmSync("out/sw.js", { force: true });
console.log("Готово: out/ — тренажёр для приложения.");
