import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('table example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}#/tables`)
  })

  test('table tag rendered', async ({ page }) => {
    await expect(page.getByRole('textbox').locator('table')).toHaveCount(1)
  })
})
