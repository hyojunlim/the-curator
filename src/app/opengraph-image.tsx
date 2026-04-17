import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Curator — AI Contract Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #00154f 0%, #002b9e 50%, #0044cc 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
            }}
          >
            AI
          </div>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "white",
              margin: 0,
              letterSpacing: "-2px",
            }}
          >
            The Curator
          </h1>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.8)",
            margin: 0,
            marginBottom: "40px",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          AI-powered contract review that identifies hidden risks before they become liabilities.
        </p>
        <div
          style={{
            display: "flex",
            gap: "32px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>Upload any contract</span>
          <span>|</span>
          <span>AI analyzes every clause</span>
          <span>|</span>
          <span>Get rewrite suggestions</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          thecurator.site
        </div>
      </div>
    ),
    { ...size }
  );
}
