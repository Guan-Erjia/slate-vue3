import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('huge document example', () => {
  const elements = [
    { tag: '[data-slate-editor] h1', count: 100 },
    { tag: '[data-slate-editor] p', count: 700 },
  ]

  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}huge-document`)
  })

  test('contains image', async ({ page }) => {
    for (const { tag, count } of elements) {
      await expect(page.locator(tag)).toHaveCount(count)
    }
  })
})
