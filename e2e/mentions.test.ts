import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('mentions example', () => {
  test.beforeEach(
    async ({ page }) =>
      await page.goto(`${E2E_BASE_URL}#/mentions`)
  )

  test('renders mention element', async ({ page }) => {
    await expect(page.locator('[data-cy="mention-R2-D2"]')).toHaveCount(1)
    await expect(page.locator('[data-cy="mention-Mace-Windu"]')).toHaveCount(1)
  })

  test('shows list of mentions', async ({ page }) => {
    await page.getByRole('textbox').click()
    await page.getByRole('textbox').selectText()
    await page.getByRole('textbox').press('Backspace')
    await page.getByRole('textbox').pressSequentially(' @ma')
    await expect(page.locator('[data-cy="mentions-portal"]')).toHaveCount(1)
  })

  test('inserts on enter from list', async ({ page }) => {
    await page.locator('[data-slate-editor]').fill('') // clear editor
    await page.keyboard.type(' ') // type text
    await page.keyboard.press("Backspace") // remove the space
    await page.keyboard.type(' @Ja')
    await page.getByRole('textbox').press('Enter')
    await expect(page.locator('[data-cy="mention-Jabba"]')).toHaveCount(1)
  })
})
