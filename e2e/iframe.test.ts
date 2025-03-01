import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('iframe editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}#/render-in-iframe`)
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
