import { render } from "@testing-library/vue";
import { Editor, Transforms } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { describe, expect, test } from "vitest";
import { h } from "vue";

describe("an empty initialValue", () => {
  // no initialValue props here
  test.skip("loads one empty block so the editor can hold a cursor and take input", async () => {
    const editor = createReactiveEditor();

    render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: h(Editable),
      },
    });

    expect(editor.children).toEqual([{ children: [{ text: "" }] }]);

    Transforms.select(editor, Editor.start(editor, []));
    editor.insertText("typed");

    expect(Editor.string(editor, [])).toBe("typed");
  });

  test("keeps a non-empty initialValue as given", () => {
    const editor = createReactiveEditor();
    const initialValue = [{ children: [{ text: "kept" }] }];
    editor.children = initialValue;

    render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: h(Editable),
      },
    });

    expect(editor.children).toBe(initialValue);
  });
});
