import { ImageResponse } from "next/og";

// Apple touch icon (iOS "Add to Home Screen"). iOS needs a raster image, so we
// render a 180×180 PNG: a black asterisk on a white background.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const bar = {
    position: "absolute" as const,
    left: 78,
    top: 26,
    width: 24,
    height: 128,
    borderRadius: 12,
    background: "#000000",
  };
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div style={{ ...bar, transform: "rotate(0deg)" }} />
        <div style={{ ...bar, transform: "rotate(60deg)" }} />
        <div style={{ ...bar, transform: "rotate(120deg)" }} />
      </div>
    ),
    size,
  );
}
