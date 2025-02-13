import { test, expect } from '@playwright/test'

test.skip('iframe editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/slate-vue3/#/iframe')
  })

  test('should be editable', async ({ page }) => {
    await page
      .frameLocator('iframe')
      .locator('body')
      .getByRole('textbox')
      .focus()
    await page.keyboard.press('Home')
    await page.keyboard.type('Hello World')
    expect(
      await page
        .frameLocator('iframe')
        .locator('body')
        .getByRole('textbox')
        .textContent()
    ).toContain('Hello World')
  })
})
