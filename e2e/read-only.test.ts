import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('readonly editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}#/read-only`)
  })

  test('should not be editable', async ({ page }) => {
    const slateEditor = '[data-slate-editor="true"]'
    expect(
      await page.locator(slateEditor).getAttribute('contenteditable')
    ).toBe('false')
    expect(await page.locator(slateEditor).getAttribute('role')).toBe(null)
    await page.locator(slateEditor).click()
    await expect(page.locator(slateEditor)).not.toBeFocused()
  })
})
