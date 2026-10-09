import { site } from "@/content/site";

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://blentera.com/#organization",
      name: "BLENTERA",
      url: "https://blentera.com/",
    },
    {
      "@type": "WebSite",
      "@id": "https://blentera.com/#website",
      url: "https://blentera.com/",
      name: "BLENTERA",
      description: site.description,
      publisher: { "@id": "https://blentera.com/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://blentera.com/#software",
      name: "BLENTERA",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: site.description,
      publisher: { "@id": "https://blentera.com/#organization" },
    },
  ],
};

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
