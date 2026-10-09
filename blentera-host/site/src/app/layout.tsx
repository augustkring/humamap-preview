import type { Metadata } from "next";
import "./globals.css";
import "./refinements.css";
import { SiteFooter } from "@/components/SiteFooter";
import { StructuredData } from "@/components/StructuredData";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: {
    default: "BLENTERA — Company AI foundation",
    template: "%s — BLENTERA",
  },
  description: site.description,
  applicationName: site.name,
  category: "Business Software",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
  metadataBase: new URL("https://blentera.com"),
  openGraph: {
    title: "BLENTERA — Build your company's AI capability once",
    description: site.description,
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BLENTERA — Company AI foundation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BLENTERA — Company AI foundation",
    description: site.description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StructuredData />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
