import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('Inlines example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}inlines`)
  })

  test('contains link', async ({ page }) => {
    expect(
      await page.getByRole('textbox').locator('a').nth(0).innerText()
    ).toContain('hyperlink')
  })

  test('arrow keys skip over read-only inline', async ({ page }) => {
    const badge = page.locator('text=Approved >> xpath=../../..')

    // Put cursor after the badge
    await badge.evaluate(badgeElement => {
      const range = document.createRange()
      range.setStartAfter(badgeElement)
      range.setEndAfter(badgeElement)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)
    })

    const getSelectionContainerText = () =>
      page.evaluate(() => {
        const selection = window.getSelection()!
        return selection.anchorNode!.textContent
      })

    expect(await getSelectionContainerText()).toBe('.')
    await page.keyboard.press('ArrowLeft')
    expect(await getSelectionContainerText()).toBe(
      '! Here is a read-only inline: '
    )
    await page.keyboard.press('ArrowRight')
    expect(await getSelectionContainerText()).toBe('.')
  })
})
