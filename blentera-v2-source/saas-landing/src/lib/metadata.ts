import type { Metadata } from 'next'

import { siteConfig } from '@/config/site'
import { getSiteUrl, isIndexable } from '@/lib/site-url'

type PageMetadata = {
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
}

// Every page's head comes from here, so no page ships half a head. A page without a title is the home page, and one without a path gets no canonical.
export function createMetadata({
  title,
  description = siteConfig.description,
  path,
  noIndex = false,
}: PageMetadata): Metadata {
  const fullTitle = `${title ?? siteConfig.title} - ${siteConfig.name}`
  const index = !noIndex && isIndexable()

  return {
    metadataBase: new URL(getSiteUrl()),
    title: fullTitle,
    description,
    applicationName: siteConfig.name,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    alternates: { canonical: noIndex ? null : path },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      // Omitted on a page without a canonical, or Next resolves an empty path to the home page.
      ...(path && !noIndex ? { url: path } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.xHandle,
      creator: siteConfig.xHandle,
      title: fullTitle,
      description,
    },
    robots: { index, follow: index, googleBot: { index, follow: index } },
  }
}
