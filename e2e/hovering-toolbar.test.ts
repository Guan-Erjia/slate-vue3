import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../test/utils";

test.describe("hovering toolbar example", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}hovering-toolbar`);
  });

  test("hovering toolbar appears", async ({ page }) => {
    await page.pause();
    await expect(page.getByTestId("menu")).toHaveCSS("opacity", "0");

    await page.locator('span[data-slate-string="true"]').nth(0).selectText();
    await expect(page.getByTestId("menu")).toHaveCount(1);

    await expect(page.getByTestId("menu")).toHaveCSS("opacity", "1");
    await expect(
      page.getByTestId("menu").locator("span.material-icons")
    ).toHaveCount(3);
  });

  test("hovering toolbar disappears", async ({ page }) => {
    await page.locator('span[data-slate-string="true"]').nth(0).selectText();
    await expect(page.getByTestId("menu")).toHaveCSS("opacity", "1");
    await page.locator('span[data-slate-string="true"]').nth(0).selectText();
    await page
      .locator("[data-slate-editor]")
      .nth(0)
      .click({ force: true, position: { x: 0, y: 0 } });

    await expect(page.getByTestId("menu")).toHaveCSS("display", "none");
  });
});
