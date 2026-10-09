import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"

export const dynamic = "force-static"
export const alt = "BLENTERA — Company AI foundation"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#0a0a0a",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.16em",
          }}
        >
          BLENTERA
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#666666",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Company AI foundation
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 980,
              fontSize: 68,
              lineHeight: 1.03,
              fontWeight: 700,
              letterSpacing: "-0.045em",
            }}
          >
            Build your company&apos;s AI capability once. Keep building on it.
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 25,
              lineHeight: 1.4,
              color: "#666666",
            }}
          >
            {siteConfig.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #dddddd",
            paddingTop: "26px",
            color: "#666666",
            fontSize: 22,
          }}
        >
          <span>Shared context · work · learning · control</span>
          <span>blentera.com</span>
        </div>
      </div>
    ),
    size
  )
}
