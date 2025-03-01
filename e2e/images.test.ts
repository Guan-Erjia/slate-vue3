import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('images example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}#/images`)
  })

  test('contains image', async ({ page }) => {
    await expect(page.getByRole('textbox').locator('img')).toHaveCount(2)
  })
})
