import { expect, test } from '@playwright/test'

import { headerNav } from '@/content/navigation'

// What a crawler without a renderer, or a visitor with JavaScript off, gets.
test.use({ javaScriptEnabled: false })

test('every section and every FAQ answer is readable without JavaScript', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  const sections = await page.locator('main section[aria-labelledby]').all()
  expect(sections.length).toBeGreaterThan(5)
  const titleIds = await Promise.all(
    sections.map((section) => section.getAttribute('aria-labelledby')),
  )
  await Promise.all(titleIds.map((id) => expect(page.locator(`[id="${id}"]`)).toBeVisible()))

  // Every question needs its answer in the HTML, not only the one open by default.
  const questions = await page.locator('[data-slot="accordion-trigger"]').count()
  const answers = await page.locator('[data-slot="accordion-content"]').all()
  expect(questions).toBeGreaterThan(0)
  expect(answers).toHaveLength(questions)
  await Promise.all(answers.map((answer) => expect(answer).toBeVisible()))
})

test("the header's links lead to sections that exist", async ({ page }) => {
  await page.goto('/')
  await Promise.all(
    headerNav.map((link) => {
      const id = new URL(link.href, 'http://localhost').hash.slice(1)
      return expect(page.locator(`section[id="${id}"]`)).toHaveCount(1)
    }),
  )
})
