import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../test/utils";

test.describe("huge document example", () => {
  const elements = [
    { tag: "[data-slate-editor] h1", count: 100 },
    { tag: "[data-slate-editor] p", count: 700 },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}huge-document`);
  });

  test("contains image", async ({ page }) => {
    for (const { tag, count } of elements) {
      await expect(page.locator(tag)).toHaveCount(count);
    }
  });

  test("autoFocus lets you type right away in strict mode", async ({
    page,
  }) => {
    await page.goto(
      `${E2E_BASE_URL}with-chunks?strict=true&blocks=10&chunking=false`,
    );
    const firstBlock = page
      .getByRole("textbox")
      .locator('[data-slate-node="element"]')
      .first();
    await expect(firstBlock).toBeVisible();
    await expect(page.getByRole("textbox")).toBeFocused();
    await page.keyboard.type("Typed");
    await expect(firstBlock).toContainText("Typed");
  });
});
