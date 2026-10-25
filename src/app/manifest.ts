import type { MetadataRoute } from "next";

const HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "vormik.vercel.app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Позволяет сайту спросить у браузера, установлено ли уже приложение (getInstalledRelatedApps).
    related_applications: [{ platform: "webapp", url: `https://${HOST}/manifest.webmanifest` }],
    prefer_related_applications: false,
    id: "/train",
    // Манифест один на все языки, поэтому название нейтральное, а язык выбирается в приложении.
    name: "Vormik",
    short_name: "Vormik",
    description: "Estonian case trainer · Тренажёр эстонских падежей · Viron sijamuodot",
    start_url: "/train",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    categories: ["education"],
    // Цвета приложения, а не сайта: тёмная заставка и тёмная системная строка.
    background_color: "#0b1220",
    theme_color: "#0b1220",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
