import { describe, expect, test } from "vitest";
import { h } from "vue";
import { render } from "@testing-library/vue";
import { DOMEditor } from "slate-vue3/dom";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";

const initialValue = [{ type: "paragraph", children: [{ text: "hello" }] }];

describe("DOMEditor.isMounted", () => {
  test("is false before the editor renders and true after", () => {
    const editor = createReactiveEditor();

    editor.children = initialValue;

    expect(DOMEditor.isMounted(editor)).toBe(false);

    render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: h(Editable),
      },
    });

    expect(DOMEditor.isMounted(editor)).toBe(true);
  });
});

describe("DOMEditor.hasDOMNode", () => {
  test("returns false instead of throwing when the editor is not mounted", () => {
    const editor = createReactiveEditor();
    const target = document.createElement("div");

    expect(DOMEditor.hasDOMNode(editor, target)).toBe(false);
  });
});
