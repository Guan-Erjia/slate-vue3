import { test, expect, Page } from "@playwright/test";
import { E2E_BASE_URL } from "../test/utils";
import {
  blockTexts,
  cutWithShortcut,
  dragSelection,
  selectStrings,
} from "./support/move-text";

const typeLines = async (page: Page, lines: string[]) => {
  const textbox = page.getByRole("textbox");
  await textbox.click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.press("Backspace");
  for (const [index, line] of lines.entries()) {
    if (index > 0) {
      await textbox.press("Enter");
    }
    await textbox.pressSequentially(line);
  }
  await expect.poll(() => blockTexts(page)).toEqual(lines);
  await page.waitForTimeout(250);
};

test.describe("plaintext example", () => {
  test.beforeEach(
    async ({ page }) => await page.goto(`${E2E_BASE_URL}plain-text`),
  );

  test("inserts text when typed", async ({ page }) => {
    await page.getByRole("textbox").press("Home");
    await page.getByRole("textbox").pressSequentially("Hello World");
    expect(await page.getByRole("textbox").textContent()).toContain(
      "Hello World",
    );
  });

  test.describe("moving whole lines", () => {
    test("dragging a line keeps the line count", async ({
      page,
      browserName,
    }) => {
      test.skip(browserName !== "firefox", "Native text drags need Firefox");
      await typeLines(page, ["one", "two", "three"]);
      await selectStrings(
        page,
        { text: "two", offset: 0 },
        { text: "three", offset: 0 },
      );
      await dragSelection(page, "two", { text: "one", edge: "end" });
      await expect
        .poll(() => blockTexts(page))
        .toEqual(["onetwo", "", "three"]);
    });

    test("dropping onto the dragged text changes nothing", async ({
      page,
      browserName,
    }) => {
      test.skip(browserName !== "firefox", "Native text drags need Firefox");
      await typeLines(page, ["one", "two", "three"]);
      await selectStrings(
        page,
        { text: "two", offset: 0 },
        { text: "three", offset: 0 },
      );
      await dragSelection(page, "two", { text: "two", edge: "end" });
      await page.waitForTimeout(300);
      expect(await blockTexts(page)).toEqual(["one", "two", "three"]);
    });

    test("cutting a line removes it and copies its line break", async ({
      page,
    }) => {
      await typeLines(page, ["one", "two", "three"]);
      await selectStrings(
        page,
        { text: "two", offset: 0 },
        { text: "three", offset: 0 },
      );
      const fragment = await cutWithShortcut(page);
      expect(fragment).toEqual([
        { type: "paragraph", children: [{ text: "two" }] },
        { type: "paragraph", children: [{ text: "" }] },
      ]);
      await expect.poll(() => blockTexts(page)).toEqual(["one", "three"]);
    });
  });

  test("inserting while blurred keeps the selection where it was", async ({
    page,
  }) => {
    const textbox = page.getByRole("textbox");
    await textbox.click();
    const lineLength = await page.evaluate(() => {
      const text = document.querySelector("[data-slate-string]")!.firstChild!;
      const length = text.textContent!.length;
      window.getSelection()!.setBaseAndExtent(text, length, text, length);
      return length;
    });
    await page.waitForTimeout(200);

    const insertWhileBlurred = (text: string) =>
      page.evaluate((text) => {
        const element = document.querySelector("[data-slate-editor]")!;

        let instance = (element as any).__vueParentComponent;
        while (
          instance &&
          !instance.props?.editor &&
          !instance.setupState?.editor
        ) {
          instance = instance.parent;
        }
        const editor = instance?.props?.editor ?? instance?.setupState?.editor;
        if (!editor) {
          throw new Error("Slate editor not found in Vue component tree");
        }

        let outside = document.querySelector<HTMLButtonElement>("#outside");
        if (!outside) {
          outside = document.createElement("button");
          outside.id = "outside";
          outside.textContent = "outside";
          document.body.appendChild(outside);
        }
        outside.focus();
        editor.insertText(text);
        return new Promise((resolve) =>
          setTimeout(() => resolve(editor.selection?.anchor.offset), 300),
        );
      }, text);

    expect(await insertWhileBlurred("-")).toBe(lineLength + 1);
    expect(await insertWhileBlurred("+")).toBe(lineLength + 2);
    await expect(textbox).toContainText("<textarea>!-+");
  });
});
