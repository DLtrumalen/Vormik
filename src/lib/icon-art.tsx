import { ImageResponse } from "next/og";

/** Иконка приложения: белая «õ» на синем фоне. */
export function renderIcon(size: number, { rounded = true } = {}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0072ce",
        borderRadius: rounded ? size * 0.22 : 0,
        color: "#ffffff",
        fontSize: size * 0.62,
        fontWeight: 600,
        lineHeight: 1,
        paddingBottom: size * 0.08,
      }}
    >
      õ
    </div>,
    { width: size, height: size },
  );
}
