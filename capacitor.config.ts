import type { CapacitorConfig } from "@capacitor/cli";

// Приложение для Google Play (и App Store): тренажёр из статичной сборки out/ внутри приложения,
// без загрузки с сайта — поэтому работает без интернета с первого запуска.
const config: CapacitorConfig = {
  // Идентификатор приложения в магазине. После публикации его нельзя поменять.
  appId: "io.github.dltrumalen.vormik",
  appName: "Vormik",
  webDir: "out",
  backgroundColor: "#0b1220",
};

export default config;
