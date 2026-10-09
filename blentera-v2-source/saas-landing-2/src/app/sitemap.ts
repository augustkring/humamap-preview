import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'
import { getSiteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(),
      lastModified: siteConfig.lastUpdated,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
