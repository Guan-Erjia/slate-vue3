import { test, expect } from '@playwright/test'

test.describe('forced layout example', () => {
  const elements = [
    { tag: 'h2', count: 1 },
    { tag: 'p', count: 1 },
  ]

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/slate-vue3/#/forced-layout')
  })

  test('checks for the elements', async ({ page }) => {
    for (const { tag, count } of elements) {
      await expect(page.locator(tag)).toHaveCount(count)
    }
  })

  test('checks if elements persist even after everything is deleted', async ({
    page,
  }) => {
    // clear the textbox
    await page.locator('div[role="textbox"]').clear()
    for (const { tag, count } of elements) {
      await expect(page.locator(tag)).toHaveCount(count)
    }
  })
})
