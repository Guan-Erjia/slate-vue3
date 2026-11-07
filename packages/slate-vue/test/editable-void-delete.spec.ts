import { createEditor, Descendant, Transforms } from "slate";
import { describe, expect, test, vi } from "vitest";
import {
  createReactiveEditor,
  Editable,
  RenderElementProps,
  Slate,
} from "slate-vue3";
import { h } from "vue";
import { fireEvent, render } from "@testing-library/vue";
import { DOMEditor } from "slate-vue3/dom";

// The keydown fallback for selected voids only runs in Chrome and Safari when
// `beforeinput` is supported, which jsdom does not report on its own.
vi.mock("slate-vue3/dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("slate-vue3/dom")>();
  return {
    ...actual,
    HAS_BEFORE_INPUT_SUPPORT: true,
    IS_WEBKIT: true,
  };
});

// jsdom does not implement `isContentEditable`.
Object.defineProperty(HTMLElement.prototype, "isContentEditable", {
  get() {
    return (
      this.closest("[contenteditable]")?.getAttribute("contenteditable") ===
      "true"
    );
  },
});

describe("slate-react", () => {
  describe("Editable", () => {
    describe("deleting a selected void", () => {
      const setup = async () => {
        const editor = createReactiveEditor();
        editor.isVoid = (element: any) => (element as any).void === true;

        const initialValue: Descendant[] = [
          { children: [{ text: "one" }] },
          { void: true, children: [{ text: "" }] } as Descendant,
          { children: [{ text: "two" }] },
        ];

        editor.children = initialValue;

        const renderElement = ({ attributes, children }: RenderElementProps) =>
          h("div", attributes, children);

        render(Slate, {
          props: {
            editor,
            renderElement,
          },
          slots: {
            default: h(Editable),
          },
        });

        Transforms.select(editor, { path: [1, 0], offset: 0 });

        return editor;
      };

      test("Delete removes the void and keeps the cursor after it", async () => {
        const editor = await setup();

        await fireEvent.keyDown(DOMEditor.toDOMNode(editor, editor), {
          key: "Delete",
          which: 46,
        });

        expect(editor.children).toEqual([
          { children: [{ text: "one" }] },
          { children: [{ text: "two" }] },
        ]);
        expect(editor.selection).toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });
      });

      test("Backspace removes the void and moves the cursor before it", async () => {
        const editor = await setup();

        await fireEvent.keyDown(DOMEditor.toDOMNode(editor, editor), {
          key: "Backspace",
          which: 8,
        });

        expect(editor.children).toEqual([
          { children: [{ text: "one" }] },
          { children: [{ text: "two" }] },
        ]);
        expect(editor.selection).toEqual({
          anchor: { path: [0, 0], offset: 3 },
          focus: { path: [0, 0], offset: 3 },
        });
      });
    });
  });
});
