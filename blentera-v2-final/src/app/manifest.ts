import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "BLENTERA",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
  }
}
