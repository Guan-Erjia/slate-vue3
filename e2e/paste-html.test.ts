import { test, expect, Page } from '@playwright/test'
import { E2E_BASE_URL } from '../test/utils'

test.describe('paste html example', () => {
  test.beforeEach(
    async ({ page }) =>
      await page.goto(`${E2E_BASE_URL}#/paste-html`)
  )

  const pasteHtml = async (page: Page, htmlContent: string) => {
    await page.locator('[data-slate-editor]').fill('') // clear editor
    await page.keyboard.type(' ') // type text
    await page.keyboard.press("Backspace") // remove the space
    await page.locator('[data-slate-editor]')
      .evaluate((el: HTMLElement, htmlContent: string) => {
        const clipboardEvent = Object.assign(
          new Event('paste', { bubbles: true, cancelable: true }),
          {
            clipboardData: {
              getData: (type = 'text/html') => htmlContent,
              types: ['text/html'],
            },
          }
        )
        el.dispatchEvent(clipboardEvent)
      }, htmlContent)
  }

  test('pasted bold text uses <strong>', async ({ page }) => {
    await pasteHtml(page, '<strong>Hello Bold</strong>')
    expect(await page.locator('strong').textContent()).toContain('Hello')
  })

  test('pasted code uses <code>', async ({ page }) => {
    await pasteHtml(page, '<code>console.log("hello from slate!")</code>')
    expect(await page.locator('code').textContent()).toContain('slate!')
  })
})
