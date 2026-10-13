import { Descendant, Editor, Transforms } from "slate";
import { describe, expect, test, vi } from "vitest";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";

vi.mock("slate-vue3/dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("slate-vue3/dom")>();
  return {
    ...actual,
    IS_FIREFOX: true,
  };
});

const renderEditor = (initialValue: Descendant[]) => {
  const editor = createReactiveEditor();
  editor.children = initialValue;

  render(Slate, {
    props: { editor },
    slots: { default: h(Editable) },
  });

  return editor;
};

describe("Firefox trailing newlines", () => {
  test.each(["abc\n", "abc\n\n"])("maps every offset in %j", async (text) => {
    const editor = renderEditor([{ children: [{ text }] }]);
    await nextTick();
    for (let offset = 0; offset <= text.length; offset++) {
      const point = { path: [0, 0], offset };
      const range = { anchor: point, focus: point };
      const domRange = DOMEditor.toDOMRange(editor, range);
      expect(
        DOMEditor.toSlateRange(editor, domRange, {
          exactMatch: true,
          suppressThrow: false,
        }),
      ).toEqual(range);
    }

    const end = Editor.end(editor, []);
    const [node] = DOMEditor.toDOMPoint(editor, end);
    const range = document.createRange();
    range.setStart(node, node.textContent!.length);
    range.collapse(true);
    expect(
      DOMEditor.toSlateRange(editor, range, {
        exactMatch: true,
        suppressThrow: false,
      }),
    ).toEqual({ anchor: end, focus: end });
  });

  test("maps native text inserted before the extra newline", async () => {
    const editor = renderEditor([{ children: [{ text: "abc\n" }] }]);
    await nextTick();
    const [node] = DOMEditor.toDOMPoint(editor, Editor.end(editor, []));
    node.textContent = "Z\n";
    const range = document.createRange();
    range.setStart(node, 1);
    range.collapse(true);
    const point = { path: [0, 0], offset: 5 };
    expect(
      DOMEditor.toSlateRange(editor, range, {
        exactMatch: true,
        suppressThrow: false,
      }),
    ).toEqual({ anchor: point, focus: point });
  });

  test("copies the model newline without the extra rendering newline", async () => {
    const editor = renderEditor([{ children: [{ text: "abc\n" }] }]);
    await nextTick();

    Transforms.select(editor, Editor.range(editor, []));
    await nextTick();

    const data = new Map<string, string>();
    const transfer = {
      getData: (type: string) => data.get(type) ?? "",
      setData: (type: string, value: string) => data.set(type, value),
    } as unknown as DataTransfer;

    DOMEditor.setFragmentData(editor, transfer);

    const html = document.createElement("div");
    html.innerHTML = data.get("text/html")!;
    expect(html.textContent).toBe("abc\n");
    expect(data.get("text/plain")).toBe("abc\n");
  });

  test("maps a trailing newline after a marked text node", async () => {
    const editor = renderEditor([
      { children: [{ text: "abc", bold: true }, { text: "\n" }] },
    ] as Descendant[]);

    const range = Editor.range(editor, []);

    await nextTick();
    const domRange = DOMEditor.toDOMRange(editor, range);
    expect(domRange.cloneContents().textContent).toBe("abc\n");
    expect(
      DOMEditor.toSlateRange(editor, domRange, {
        exactMatch: true,
        suppressThrow: false,
      }),
    ).toEqual(range);
  });

  test("updates the text after inserting and removing a trailing newline", async () => {
    const editor = renderEditor([{ children: [{ text: "abc" }] }]);
    await nextTick();

    Transforms.select(editor, Editor.end(editor, []));
    editor.insertText("\n");
    await nextTick();

    editor.insertText("Z");
    await nextTick();

    const domRange = DOMEditor.toDOMRange(editor, Editor.range(editor, []));
    expect(domRange.cloneContents().textContent).toBe("abc\nZ");

    editor.deleteBackward("character");
    await nextTick();

    const end = Editor.end(editor, []);
    const range = { anchor: end, focus: end };
    expect(
      DOMEditor.toSlateRange(editor, DOMEditor.toDOMRange(editor, range), {
        exactMatch: true,
        suppressThrow: false,
      }),
    ).toEqual(range);
  });
});
