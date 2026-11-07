import { render, cleanup } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { createReactiveEditor } from "slate-vue3";
import { DOMEditor, IS_COMPOSING } from "slate-vue3/dom";
import { Editor } from "slate";

import { Editable, Slate } from "slate-vue3";
import { describe, afterEach, test, expect } from "vitest";
import { sleep } from "@test-utils";

const setup = (text: string) => {
  const editor = createReactiveEditor();

  editor.children = [{ type: "paragraph", children: [{ text }] }];

  render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: () => h(Editable),
    },
  });

  return editor;
};

const domText = (editor: ReturnType<typeof createReactiveEditor>) => {
  const [text] = Editor.nodes(editor, { at: [0, 0] });
  const element = DOMEditor.toDOMNode(editor, text[0]);

  return element.querySelector("[data-slate-string]")!
    .firstChild as globalThis.Text;
};

describe("DOMEditor.getWord", () => {
  afterEach(() => {
    cleanup();
  });

  test("matches Editor.word when nothing is being composed", async () => {
    const editor = setup("hello world");

    editor.selection = {
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 8 },
    };

    expect(DOMEditor.getWord(editor)).toEqual({
      range: Editor.word(editor),
      text: "world",
    });
  });

  test("includes text that is still being composed", async () => {
    const editor = setup("hello wor");
    const node = domText(editor);

    IS_COMPOSING.set(editor, true);
    try {
      node.textContent = "hello world";
      document.getSelection()!.collapse(node, 11);

      expect(DOMEditor.getWord(editor)?.text).toBe("world");

      expect(
        Editor.string(
          editor,
          Editor.word(editor, {
            at: { path: [0, 0], offset: 9 },
          })!,
        ),
      ).toBe("wor");
    } finally {
      IS_COMPOSING.set(editor, false);
    }
  });
});
