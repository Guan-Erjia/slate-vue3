import { test, expect } from '@playwright/test'

test.describe('huge document example', () => {
  const elements = [
    { tag: '[data-slate-editor] h1', count: 100 },
    { tag: '[data-slate-editor] p', count: 700 },
  ]

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/slate-vue3/#/huge-document')
  })

  test('contains image', async ({ page }) => {
    for (const { tag, count } of elements) {
      await expect(page.locator(tag)).toHaveCount(count)
    }
  })
})
