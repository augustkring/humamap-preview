import { siteConfig } from '@/config/site'
import { hero } from '@/content/hero'
import { headerAction } from '@/content/navigation'
import { OG_CONTENT_TYPE, OG_SIZE, createOgImage } from '@/lib/og'

export const alt = `${siteConfig.name}: ${siteConfig.title}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return createOgImage({
    title: hero.title,
    eyebrow: `${hero.eyebrow.lead} ${hero.eyebrow.emphasis}`,
    description: siteConfig.tagline,
    cta: headerAction.label,
  })
}
