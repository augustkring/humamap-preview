import { type Page, expect, test } from '@playwright/test'

import { siteConfig } from '@/config/site'
import { headerAction } from '@/content/navigation'

// A production build minifies React's messages, so the error codes are what give a hydration failure away.
const HYDRATION = /hydrat|didn't match|#(418|423|425)/i

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`the page hydrates without errors with reduced motion ${reducedMotion}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion })
    const page = await context.newPage()
    const errors = collectErrors(page)

    await page.goto('/')
    await page.mouse.wheel(0, 20_000)
    await page.waitForTimeout(1500)

    expect(errors.filter((error) => HYDRATION.test(error))).toEqual([])
    expect(errors).toEqual([])
    await context.close()
  })
}

test('the theme toggle and the D key switch the theme', async ({ page }) => {
  await page.goto('/')
  const isDark = () => page.evaluate(() => document.documentElement.classList.contains('dark'))
  const startsDark = await isDark()

  await page.getByRole('button', { name: 'Toggle Theme' }).click()
  await expect.poll(isDark).toBe(!startsDark)

  await page.keyboard.press('d')
  await expect.poll(isDark).toBe(startsDark)
})

test('the logo scrolls back to the top of the home page', async ({ page }) => {
  await page.goto('/')
  await page.mouse.wheel(0, 3000)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  await page.getByRole('banner').getByRole('link', { name: siteConfig.name }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('a header link jumps straight to its section', async ({ page }) => {
  await page.goto('/')
  const link = page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Questions & Answers' })

  // Every scroll position for a second after the click: a smooth scroll passes through many, a jump through one.
  const positions = await link.evaluate(
    (anchor) =>
      new Promise<number[]>((resolve) => {
        const seen = [window.scrollY]
        const started = performance.now()
        const sample = () => {
          if (window.scrollY !== seen.at(-1)) seen.push(window.scrollY)
          if (performance.now() - started < 1000) requestAnimationFrame(sample)
          else resolve(seen)
        }
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        requestAnimationFrame(sample)
      }),
  )

  expect(positions).toHaveLength(2)
  await expect(page.locator('#faq-title')).toBeInViewport()
})

test('the copy button copies the clone command', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await page.getByRole('button', { name: 'Copy Command' }).click()

  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `git clone ${siteConfig.links.repository}`,
  )
})

// From a tablet up, the header's parts sit apart and its links keep to one line.
for (const width of [768, 820, 1024, 1280]) {
  test(`the header fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const banner = page.getByRole('banner')
    const nav = banner.getByRole('navigation', { name: 'Main' })
    // The logo, the links where they show, and the action with the menu button beside it.
    const groups = [
      [banner.getByRole('link', { name: siteConfig.name, exact: true })],
      [nav],
      [
        banner.getByRole('link', { name: headerAction.label, exact: true }),
        banner.getByRole('button', { name: 'Open Menu' }),
      ],
    ]

    const spans = await Promise.all(
      groups.map(async (group) => {
        const boxes = await Promise.all(
          group.map(async (part) => ((await part.isVisible()) ? part.boundingBox() : null)),
        )
        const shown = boxes.filter((box) => box !== null)
        if (shown.length === 0) return []
        const left = Math.min(...shown.map((box) => box.x))
        return [{ left, right: Math.max(...shown.map((box) => box.x + box.width)) }]
      }),
    )
    const edges = spans.flat().toSorted((first, second) => first.left - second.left)
    expect(edges.length).toBeGreaterThanOrEqual(2)
    for (const [index, edge] of edges.entries()) {
      if (index > 0) expect(edge.left - edges[index - 1].right).toBeGreaterThanOrEqual(16)
    }

    const wrapped = await nav.getByRole('link').evaluateAll((links) =>
      links
        .filter((link) => {
          const style = getComputedStyle(link)
          const oneLine =
            Number.parseFloat(style.lineHeight) +
            Number.parseFloat(style.paddingTop) +
            Number.parseFloat(style.paddingBottom)
          return link.getBoundingClientRect().height > oneLine + 1
        })
        .map((link) => link.textContent),
    )
    expect(wrapped).toEqual([])
  })
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the menu opens, links through and hands focus back', async ({ page }) => {
    await page.goto('/')
    const trigger = page.locator('button[aria-label="Open Menu"]')
    await trigger.click()

    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await menu.getByRole('link', { name: 'Questions & Answers' }).click()
    await expect(menu).toBeHidden()
    await expect(page).toHaveURL(/#faq$/)
    await expect(page.locator('#faq-title')).toBeInViewport()
  })
})
