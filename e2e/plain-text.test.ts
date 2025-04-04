import { test, expect } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('plaintext example', () => {
  test.beforeEach(
    async ({ page }) =>
      await page.goto(`${E2E_BASE_URL}plain-text`)
  )

  test('inserts text when typed', async ({ page }) => {
    await page.getByRole('textbox').press('Home')
    await page.getByRole('textbox').pressSequentially('Hello World')
    expect(await page.getByRole('textbox').textContent()).toContain(
      'Hello World'
    )
  })
})
