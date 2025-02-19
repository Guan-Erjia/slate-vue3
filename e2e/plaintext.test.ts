import { test, expect } from '@playwright/test'

test.describe('plaintext example', () => {
  test.beforeEach(
    async ({ page }) =>
      await page.goto('http://localhost:5173/slate-vue3/#/plaintext')
  )

  test('inserts text when typed', async ({ page }) => {
    await page.getByRole('textbox').press('Home')
    await page.getByRole('textbox').pressSequentially('Hello World')
    expect(await page.getByRole('textbox').textContent()).toContain(
      'Hello World'
    )
  })
})
