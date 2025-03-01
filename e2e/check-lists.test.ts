import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from "../test/utils";

test.describe("Check-lists example", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}#/check-lists`);
  })

  test('checks the bullet when clicked', async ({ page }) => {
    const slateNodeElement = 'div[data-slate-node="element"]'

    expect(await page.locator(slateNodeElement).nth(3).textContent()).toBe(
      'Criss-cross!'
    )

    await expect(
      page.locator(slateNodeElement).nth(3).locator('span').nth(1)
    ).toHaveCSS('text-decoration-line', 'line-through')

    // Unchecking the checkboxes should un-cross the corresponding text.
    await page
      .locator(slateNodeElement)
      .nth(3)
      .locator('span')
      .nth(0)
      .locator('input')
      .uncheck()
    expect(await page.locator(slateNodeElement).nth(3).textContent()).toBe(
      'Criss-cross!'
    )
    await expect(
      page.locator(slateNodeElement).nth(3).locator('span').nth(1)
    ).toHaveCSS('text-decoration-line', 'none')

    await expect(page.locator('p[data-slate-node="element"]')).toHaveCount(2)
  })
})
