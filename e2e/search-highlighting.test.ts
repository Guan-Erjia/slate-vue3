import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('search highlighting', () => {
  test.beforeEach(
    async ({ page }) =>
      await page.goto(`${E2E_BASE_URL}#/search-highlighting`)
  )

  test('highlights the searched text', async ({ page }) => {
    const searchField = 'input[type="search"]'
    const highlightedText = 'search-highlighted'

    await page.locator(searchField).fill('text')
    await expect(page.locator(`[data-cy="${highlightedText}"]`)).toHaveCount(2)
  })
})
