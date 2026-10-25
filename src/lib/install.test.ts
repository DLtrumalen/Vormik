import { describe, expect, it } from "vitest";
import { detectDevice, openInChromeUrl } from "./install";

const UA = {
  androidChrome:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36",
  androidTelegram:
    "Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.0.0 Mobile Safari/537.36 Telegram-Android/12.0.1",
  androidSamsung:
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36",
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0 Mobile/15E148 Safari/604.1",
  iphoneInstagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0",
  ipad: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  windowsChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  windowsEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
};

describe("detectDevice", () => {
  it("Chrome на Android", () => {
    expect(detectDevice(UA.androidChrome)).toEqual({
      os: "android",
      browser: "chrome",
      inApp: false,
    });
  });

  it("встроенный браузер Telegram на Android", () => {
    expect(detectDevice(UA.androidTelegram)).toMatchObject({ os: "android", inApp: true });
  });

  it("Samsung Internet", () => {
    expect(detectDevice(UA.androidSamsung)).toMatchObject({ os: "android", browser: "samsung" });
  });

  it("Safari и Chrome на iPhone", () => {
    expect(detectDevice(UA.iphoneSafari)).toEqual({ os: "ios", browser: "safari", inApp: false });
    expect(detectDevice(UA.iphoneChrome)).toMatchObject({ os: "ios", browser: "chrome" });
  });

  it("Instagram на iPhone", () => {
    expect(detectDevice(UA.iphoneInstagram)).toMatchObject({ os: "ios", inApp: true });
  });

  it("iPad, который выдаёт себя за Mac", () => {
    expect(detectDevice(UA.ipad, "MacIntel", 5)).toMatchObject({ os: "ios", browser: "safari" });
    expect(detectDevice(UA.ipad, "MacIntel", 0)).toMatchObject({ os: "desktop" });
  });

  it("Chrome и Edge на Windows", () => {
    expect(detectDevice(UA.windowsChrome)).toMatchObject({ os: "desktop", browser: "chrome" });
    expect(detectDevice(UA.windowsEdge)).toMatchObject({ os: "desktop", browser: "edge" });
  });
});

describe("openInChromeUrl", () => {
  it("строит intent-ссылку для Chrome", () => {
    expect(openInChromeUrl("https://vormik.vercel.app/")).toBe(
      "intent://vormik.vercel.app/#Intent;scheme=https;package=com.android.chrome;end",
    );
  });
});
