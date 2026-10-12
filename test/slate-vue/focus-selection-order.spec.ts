import { render } from "@testing-library/vue";
import { Descendant, Transforms } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { describe, expect, test, vi } from "vitest";
import { h, nextTick } from "vue";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "hello world" }] },
];

describe("ReactEditor.focus", () => {
  test("restores the DOM selection after focusing the editable", async () => {
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

    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });

    await nextTick();

    const el = DOMEditor.toDOMNode(editor, editor);
    const calls: string[] = [];
    const focus = vi
      .spyOn(el, "focus")
      .mockImplementation(() => calls.push("focus"));
    const addRange = vi
      .spyOn(Selection.prototype, "addRange")
      .mockImplementation(() => calls.push("addRange"));

    DOMEditor.focus(editor);

    expect(calls).toEqual(["focus", "addRange"]);
    focus.mockRestore();
    addRange.mockRestore();
  });
});
