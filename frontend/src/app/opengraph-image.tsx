import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CapitalAI — AI for Asset & Capital Management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0F1D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Animated Brand 3-Bar Graphic */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 36 }}>
          <div
            style={{
              width: 24,
              height: 48,
              borderRadius: 12,
              background: "#00D2FF",
            }}
          />
          <div
            style={{
              width: 24,
              height: 72,
              borderRadius: 12,
              background: "#0077FF",
            }}
          />
          <div
            style={{
              width: 24,
              height: 96,
              borderRadius: 12,
              background: "#0044FF",
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>Capital</span>
          <span style={{ color: "#38BDF8" }}>AI</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 30,
            color: "#94A3B8",
            marginTop: 16,
            fontWeight: 500,
          }}
        >
          AI for Asset &amp; Capital Management
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 28,
            marginTop: 40,
            fontSize: 18,
            color: "#64748B",
            fontWeight: 600,
          }}
        >
          <span>Portfolio Optimizer</span>
          <span style={{ color: "#334155" }}>•</span>
          <span>Stress Testing</span>
          <span style={{ color: "#334155" }}>•</span>
          <span>Risk Safeguards</span>
          <span style={{ color: "#334155" }}>•</span>
          <span>FRTB Liquidity</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
