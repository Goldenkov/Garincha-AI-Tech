import { ImageResponse } from "next/og";

import { businessRebootConfig } from "@/lib/business-reboot-content";

export const alt = businessRebootConfig.publicName;
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
          background: "#050713",
          color: "#f8fafc",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              border: "1px solid rgba(103,232,249,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ecfeff",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            AI
          </div>
          <div style={{ fontSize: 22, letterSpacing: "0.28em", color: "#67e8f9", textTransform: "uppercase" }}>
            Premium AI toolkit
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", maxWidth: 980 }}>
            {businessRebootConfig.publicName}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "#94a3b8", maxWidth: 920 }}>
            Соберите основу продвижения за 1–2 вечера: оффер, контент, скрипты, квиз, структуру лендинга и первые действия для проверки спроса.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 22 }}>
          <span>business-rebootai.ru</span>
          <span>{businessRebootConfig.price}</span>
        </div>
      </div>
    ),
    size,
  );
}
