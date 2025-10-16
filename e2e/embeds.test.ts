import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../test/utils";

test.describe("embeds example", () => {
  const slateEditor = 'div[data-slate-editor="true"]';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}embeds`);
  });

  test("contains embeded", async ({ page }) => {
    await expect(page.locator(slateEditor).locator("iframe")).toHaveCount(1);
  });
});
