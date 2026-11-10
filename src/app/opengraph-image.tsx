import { ImageResponse } from "next/og";

// Картинка для превью ссылки в мессенджерах и соцсетях: одна на все языки.
export const alt = "Vormik — Estonian case trainer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "0 96px",
        background: "radial-gradient(120% 90% at 50% -10%, #16305c 0%, #0b1220 60%)",
        color: "#eef2f8",
      }}
    >
      <div
        style={{
          width: 220,
          height: 220,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0072ce",
          borderRadius: 48,
          color: "#ffffff",
          fontSize: 150,
          fontWeight: 600,
          paddingBottom: 18,
        }}
      >
        õ
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>Vormik</div>
        <div style={{ fontSize: 40, color: "#8a97ad" }}>Estonian case trainer</div>
        <div style={{ fontSize: 40, color: "#8a97ad" }}>Тренажёр эстонских падежей</div>
      </div>
    </div>,
    size,
  );
}
