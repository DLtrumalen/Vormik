import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/train",
    name: "Vormik — тренажёр эстонских падежей",
    short_name: "Vormik",
    description: "Тренируйте формы эстонских слов во всех 14 падежах. Объяснения на русском.",
    lang: "ru",
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
