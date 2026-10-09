import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BLENTERA",
    short_name: "BLENTERA",
    description: "Company AI foundation",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f4",
    theme_color: "#111311",
  };
}
