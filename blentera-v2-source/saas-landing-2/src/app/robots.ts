import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/site-url'

// Crawlers may read everything; previews stay out of search through noindex, never through robots.txt.
export default function robots(): MetadataRoute.Robots {
  const url = getSiteUrl()

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  }
}
