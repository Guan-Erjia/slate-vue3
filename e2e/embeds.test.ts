import { test, expect } from '@playwright/test'

test.describe('embeds example', () => {
  const slateEditor = 'div[data-slate-editor="true"]'

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/slate-vue3/#/embeds')
  })

  test('contains embeded', async ({ page }) => {
    await expect(page.locator(slateEditor).locator('iframe')).toHaveCount(1)
  })
})
