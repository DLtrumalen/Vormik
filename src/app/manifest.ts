import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vormik — тренажёр эстонских падежей",
    short_name: "Vormik",
    description: "Тренируйте формы эстонских слов во всех 14 падежах. Объяснения на русском.",
    lang: "ru",
    start_url: "/train",
    scope: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#0072ce",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
