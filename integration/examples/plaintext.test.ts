import { test, expect, Page } from "@playwright/test";
import { getEditorHandle } from "../support/editor";
import {
  blockTexts,
  cutWithShortcut,
  dragSelection,
  selectStrings,
} from "../support/move-text";

const typeLines = async (page: Page, lines: string[]) => {
  const textbox = page.getByRole("textbox");
  await textbox.click();
  await textbox.selectText();
  await textbox.press("Backspace");
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
    async ({ page }) =>
      await page.goto("http://localhost:5173/slate-vue3/examples/plaintext"),
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

    const editorHandle = await getEditorHandle(textbox);
    const insertWhileBlurred = (text: string) =>
      editorHandle.evaluate((editor, text) => {
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
    await editorHandle.dispose();
  });

  test("a selection made just before blur reaches the editor", async ({
    page,
  }) => {
    const textbox = page.getByRole("textbox");
    await textbox.click();
    await page.waitForTimeout(200);

    const editor = await getEditorHandle(textbox);
    const offset = await editor.evaluate(async (editor) => {
      const text = document.querySelector("[data-slate-string]")!.firstChild!;
      const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      window.getSelection()!.setBaseAndExtent(text, 1, text, 1);
      await wait(20);
      window.getSelection()!.setBaseAndExtent(text, 5, text, 5);
      await wait(20);
      const outside = document.createElement("button");
      outside.textContent = "outside";
      document.body.appendChild(outside);
      outside.focus();
      await wait(300);
      return editor.selection?.anchor.offset;
    });
    await editor.dispose();

    expect(offset).toBe(5);
  });
});
