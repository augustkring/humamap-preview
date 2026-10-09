import { afterEach, describe, expect, it, vi } from 'vitest'

import { siteConfig } from '@/config/site'
import { createMetadata } from '@/lib/metadata'

describe('createMetadata', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('gives the home page the site title and every other page a titled suffix', () => {
    expect(createMetadata({ path: '/' }).title).toBe(`${siteConfig.title} - ${siteConfig.name}`)
    expect(createMetadata({ title: 'Blog', path: '/blog' }).title).toBe(`Blog - ${siteConfig.name}`)
  })

  it('points the canonical at the page and keeps a noindex page without one', () => {
    expect(createMetadata({ title: 'Blog', path: '/blog' }).alternates?.canonical).toBe('/blog')
    expect(
      createMetadata({ title: 'Page Not Found', noIndex: true }).alternates?.canonical,
    ).toBeNull()
    expect(createMetadata({}).alternates?.canonical).toBeUndefined()
  })

  it('lets search engines index production, on its own domain', () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'example.com')
    const metadata = createMetadata({ path: '/' })

    expect(metadata.robots).toMatchObject({ index: true, follow: true })
    expect(String(metadata.metadataBase)).toBe('https://example.com/')
    expect(metadata.alternates?.canonical).toBe('/')
  })

  it('keeps previews out of search', () => {
    vi.stubEnv('VERCEL_ENV', 'preview')

    expect(createMetadata({ path: '/' }).robots).toMatchObject({ index: false, follow: false })
  })

  it('tells robots to stay away from a page marked noindex', () => {
    expect(createMetadata({ path: '/', noIndex: true }).robots).toMatchObject({
      index: false,
      follow: false,
    })
  })
})
