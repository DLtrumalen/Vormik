import type { NextConfig } from "next";

// Сборка для приложения в магазинах (Capacitor): только статичные файлы в out/, без сервера.
// Запускается через scripts/build-app.mjs (npm run build:app).
const appBuild = process.env.VORMIK_APP === "1";

const nextConfig: NextConfig = {
  // Статичная сборка не поддерживает частичную пререндеринг-разметку — для приложения она выключена.
  cacheComponents: !appBuild,
  ...(appBuild && { output: "export" }),
  // Код в браузере узнаёт, что он внутри приложения из магазина (см. isStoreApp).
  env: { NEXT_PUBLIC_VORMIK_APP: appBuild ? "1" : "" },
  // Заголовки задаёт сервер, а у приложения из магазина его нет.
  headers: appBuild ? undefined : headers,
  partialPrefetching: !appBuild,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

async function headers() {
  return [
    {
      source: "/sw.js",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      ],
    },
  ];
}

export default nextConfig;
