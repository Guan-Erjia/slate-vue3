import { render } from "@testing-library/vue";
import { createEditor, Descendant, Editor, Transforms } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { describe, expect, test } from "vitest";
import { h, nextTick } from "vue";

const clipboard = () => {
  const data: Record<string, string> = {};
  return {
    data,
    transfer: {
      setData: (type: string, value: string) => {
        data[type] = value;
      },
    } as unknown as DataTransfer,
  };
};

const copyAll = async (initialValue: Descendant[]) => {
  const editor = createReactiveEditor();
  editor.children = initialValue;

  render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: h(Editable),
    },
  });

  await nextTick();

  Transforms.select(editor, Editor.range(editor, []));

  const { data, transfer } = clipboard();
  DOMEditor.setFragmentData(editor, transfer);
  return data;
};

const lines = (...texts: string[]): Descendant[] =>
  texts.map((text) => ({ children: [{ text }] }));

describe("setFragmentData", () => {
  test("keeps an empty block as a line break in the copied HTML", async () => {
    const editor = createReactiveEditor();

    editor.children = [
      { children: [{ text: "before" }] },
      { children: [{ text: "" }] },
      { children: [{ text: "after" }] },
    ];

    render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: h(Editable),
      },
    });

    await nextTick();

    Transforms.select(editor, Editor.range(editor, []));

    const { data, transfer } = clipboard();
    DOMEditor.setFragmentData(editor, transfer);

    const html = document.createElement("div");
    html.innerHTML = data["text/html"];
    const emptyBlock = html.querySelector('[data-slate-zero-width="n"]');
    expect(emptyBlock?.innerHTML).toBe("<br>");
    expect(data["text/plain"]).toBe("before\n\nafter\n");
  });

  test("copies one blank line per empty block as plain text", async () => {
    const result = await copyAll(lines("a", "", "", "b"));
    expect(result["text/plain"]).toBe("a\n\n\nb\n");
  });

  test("keeps a soft line break inside a block", async () => {
    const result = await copyAll(lines("a\nb"));
    expect(result["text/plain"]).toBe("a\nb");
  });
});
