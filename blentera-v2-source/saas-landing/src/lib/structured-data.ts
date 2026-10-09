import { siteConfig } from '@/config/site'
import type { Faq } from '@/content/faq'
import { stripInlineCode } from '@/lib/inline-code'
import { getSiteUrl } from '@/lib/site-url'

// 7Ovr publishes the starter, so it is the organisation behind every page.
const publisher = {
  '@type': 'Organization',
  name: siteConfig.author.name,
  url: siteConfig.author.url,
}

export function siteSchemas() {
  const url = getSiteUrl()

  return [
    {
      '@context': 'https://schema.org',
      ...publisher,
      logo: `${url}/brand/7ovr-logo-512.png`,
      sameAs: [siteConfig.links.github, siteConfig.links.x],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url,
      description: siteConfig.description,
      publisher,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: siteConfig.name,
      description: siteConfig.description,
      codeRepository: siteConfig.links.repository,
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Next.js',
      license: 'https://opensource.org/license/mit',
      url,
      author: publisher,
    },
  ]
}

// Built from the same items the FAQ section renders, so the markup always matches the page.
export function faqPageSchema(items: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: stripInlineCode(item.answer) },
    })),
  }
}
