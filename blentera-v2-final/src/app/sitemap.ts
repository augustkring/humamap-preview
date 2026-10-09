import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://blentera.com",
      lastModified: new Date("2026-10-09"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}
