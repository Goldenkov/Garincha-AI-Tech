import { ImageResponse } from "next/og";

import { brand } from "@/lib/brand";

export const alt = brand.product;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f1ea",
          color: "#1c1b19",
          padding: "72px",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: "0.2em", textTransform: "uppercase" }}>Garincha AI-Tech</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 26, letterSpacing: "0.16em", color: "#0e5d58", textTransform: "uppercase" }}>{brand.product}</div>
          <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: "-0.02em", maxWidth: 900 }}>Большая идея. Первый реальный шаг.</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#5c5850" }}>От выбора направления до плана проверки спроса — шаг за шагом.</div>
      </div>
    ),
    size,
  );
}
