import { type APIResponse, type Page, expect, test } from '@playwright/test'

import { siteConfig } from '@/config/site'

// Run against a preview build, every page must stay out of search; against production, in it.
const preview = Boolean(process.env.E2E_PREVIEW)

type JsonLdNode = { '@type'?: string; [key: string]: unknown }

function meta(page: Page, selector: string) {
  return page.locator(selector).first().getAttribute('content')
}

async function jsonLd(page: Page): Promise<JsonLdNode[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((block) => {
    const parsed = JSON.parse(block) as JsonLdNode | JsonLdNode[]
    return Array.isArray(parsed) ? parsed : [parsed]
  })
}

// Width and height from a PNG's header, so an image's size is checked without decoding it.
async function pngSize(response: APIResponse) {
  const bytes = await response.body()
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

test.describe('the home page', () => {
  test('ships a complete head', async ({ page, baseURL }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)

    await expect(page).toHaveTitle(`${siteConfig.title} - ${siteConfig.name}`)
    expect(await meta(page, 'meta[name="description"]')).toBe(siteConfig.description)
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(baseURL)
    expect(await meta(page, 'meta[property="og:url"]')).toBe(baseURL)
    expect(await meta(page, 'meta[property="og:title"]')).toBe(
      `${siteConfig.title} - ${siteConfig.name}`,
    )
    expect(await meta(page, 'meta[property="og:image"]')).toMatch(`${baseURL}/opengraph-image`)
    expect(await meta(page, 'meta[name="twitter:card"]')).toBe('summary_large_image')
    expect(await meta(page, 'meta[name="robots"]')).toBe(
      preview ? 'noindex, nofollow' : 'index, follow',
    )
  })

  test('has one h1 and never skips a heading level', async ({ page }) => {
    await page.goto('/')
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName[1])))

    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
    for (const [index, level] of levels.entries()) {
      if (index > 0) expect(level).toBeLessThanOrEqual(levels[index - 1] + 1)
    }
  })

  test('has its landmarks and a skip link first in the tab order', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('banner')).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveAttribute('id', 'main')
    await expect(page.getByRole('contentinfo')).toHaveCount(1)

    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip To Content' })
    await expect(skip).toBeFocused()
    await expect(skip).toHaveAttribute('href', '#main')
    // Once focused it is a real target, at least the 24px WCAG 2.2 asks for.
    expect((await skip.boundingBox())?.height).toBeGreaterThanOrEqual(24)
  })

  test('describes itself in JSON-LD that matches the page', async ({ page, baseURL }) => {
    await page.goto('/')
    const nodes = await jsonLd(page)
    const types = nodes.map((node) => node['@type'])
    expect(types).toEqual(
      expect.arrayContaining(['Organization', 'WebSite', 'SoftwareSourceCode', 'FAQPage']),
    )
    expect(nodes.find((node) => node['@type'] === 'WebSite')?.url).toBe(baseURL)

    // Google only accepts FAQ markup for questions and answers the page itself shows.
    const faqPage = nodes.find((node) => node['@type'] === 'FAQPage')
    const entities = faqPage?.mainEntity as
      | { name: string; acceptedAnswer: { text: string } }[]
      | undefined
    expect(entities?.length).toBeGreaterThan(0)
    await Promise.all(
      (entities ?? []).flatMap((entity) => [
        expect(page.getByRole('heading', { name: entity.name, exact: true })).toHaveCount(1),
        expect(page.locator('p', { hasText: entity.acceptedAnswer.text })).toHaveCount(1),
      ]),
    )
  })
})

test('a missing page is a 404 with its own title and no canonical', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle(`Page Not Found - ${siteConfig.name}`)
  expect(await meta(page, 'meta[name="robots"]')).toMatch(/noindex/)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})

test.describe('the files crawlers read', () => {
  test('robots.txt lets every crawler in and points at the sitemap', async ({
    request,
    baseURL,
  }) => {
    const body = await (await request.get('/robots.txt')).text()
    expect(body).toMatch(/^Allow: \/$/m)
    expect(body).not.toMatch(/^Disallow: \/$/m)
    expect(body).toContain(`Sitemap: ${baseURL}/sitemap.xml`)
  })

  test('the sitemap lists exactly the pages there are', async ({ request, baseURL }) => {
    const body = await (await request.get('/sitemap.xml')).text()
    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    expect(urls).toEqual([baseURL])
  })

  test('the manifest names the site and lists its icons', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json()
    expect(manifest.name).toBe(siteConfig.name)
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('the icons and the share image are served at their sizes', async ({ page, request }) => {
    await page.goto('/')
    const shareImage = await meta(page, 'meta[property="og:image"]')
    const og = await request.get(shareImage ?? '')
    expect(og.headers()['content-type']).toBe('image/png')
    expect(await pngSize(og)).toEqual({ width: 1200, height: 630 })

    const appleIcon = await request.get('/apple-icon.png')
    expect(await pngSize(appleIcon)).toEqual({ width: 180, height: 180 })
    expect((await request.get('/icon.svg')).headers()['content-type']).toContain('image/svg+xml')
    expect((await request.get('/favicon.ico')).status()).toBe(200)
  })
})

test('every response carries the security headers, and noindex outside production', async ({
  request,
}) => {
  const paths = ['/', '/robots.txt', '/this-page-does-not-exist']
  const responses = await Promise.all(paths.map((path) => request.get(path)))
  for (const response of responses) {
    const headers = response.headers()
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['permissions-policy']).toContain('camera=()')
    expect(headers['x-robots-tag']).toBe(preview ? 'noindex' : undefined)
  }
})
