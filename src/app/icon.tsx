import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #00154f 0%, #002b9e 100%)",
          borderRadius: "96px",
        }}
      >
        <span
          style={{
            fontSize: "280px",
            fontWeight: 900,
            color: "white",
            fontFamily: "sans-serif",
            letterSpacing: "-10px",
          }}
        >
          C
        </span>
      </div>
    ),
    { ...size }
  );
}
