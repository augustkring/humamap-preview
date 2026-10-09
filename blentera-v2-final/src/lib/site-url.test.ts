import { describe, expect, it } from 'vitest'

import { getSiteUrl, isIndexable } from '@/lib/site-url'

describe('getSiteUrl', () => {
  it('prefers SITE_URL and keeps only its origin', () => {
    expect(
      getSiteUrl({
        SITE_URL: 'https://example.com/',
        VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app',
      }),
    ).toBe('https://example.com')
    expect(getSiteUrl({ SITE_URL: 'https://example.com/landing/' })).toBe('https://example.com')
  })

  it('rejects a SITE_URL without a scheme', () => {
    expect(() => getSiteUrl({ SITE_URL: 'example.com' })).toThrow('absolute URL')
  })

  it("falls back to Vercel's production domain", () => {
    expect(getSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app' })).toBe(
      'https://example.vercel.app',
    )
  })

  it('uses localhost when nothing is set', () => {
    expect(getSiteUrl({})).toBe('http://localhost:3000')
  })

  it('refuses to build an indexed site that would point at localhost', () => {
    expect(() => getSiteUrl({ SITE_ENV: 'production' })).toThrow('set SITE_URL')
  })
})

describe('isIndexable', () => {
  it("indexes Vercel's production deploys and any host that says it is production", () => {
    expect(isIndexable({ VERCEL_ENV: 'production' })).toBe(true)
    expect(isIndexable({ SITE_ENV: 'production' })).toBe(true)
  })

  it('keeps preview deploys and local builds out of search', () => {
    expect(isIndexable({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(isIndexable({})).toBe(false)
  })
})
