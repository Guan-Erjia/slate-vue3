import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../test/utils";

test.describe("huge document example", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}huge-document2`);
  });

  test("uses chunking", async ({ page }) => {
    await expect(page.getByLabel("Blocks")).toHaveValue("10000");
    await expect(page.getByLabel("Chunk size")).toHaveValue("1000");
    await expect(page.locator("[data-slate-chunk]")).toHaveCount(10);
  });
});
