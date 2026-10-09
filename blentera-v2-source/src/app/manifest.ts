import type { MetadataRoute } from 'next'

import { siteConfig } from '@/config/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: '7Ovr Landing',
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/brand/7ovr-logo-512.png', type: 'image/png', sizes: '512x512' },
    ],
  }
}
