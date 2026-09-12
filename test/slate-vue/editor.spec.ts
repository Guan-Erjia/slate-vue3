import { render } from "@testing-library/vue";
import { describe, test, expect, vi } from "vitest";
import { Transforms } from "slate-vue3/core";
import { DOMEditor } from "slate-vue3/dom";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { h, nextTick } from "vue";

describe("slate-vue", () => {
  describe("Editor", () => {
    describe(".focus", () => {
      test("should set focus in top of document with no editor selection", async () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = createReactiveEditor();
        editor.children = initialValue;

        const testSelection = {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        };

        render(Slate, {
          props: { editor },
          slots: {
            default: h(Editable),
          },
        });

        await nextTick();
        expect(editor.selection).toBe(null);
        DOMEditor.focus(editor);
        expect(editor.selection).toEqual(testSelection);

        const windowSelection = DOMEditor.getWindow(editor).getSelection();
        expect(windowSelection?.focusNode?.textContent).toBe("test");
        expect(windowSelection?.anchorNode?.textContent).toBe("test");
        expect(windowSelection?.anchorOffset).toBe(testSelection.anchor.offset);
        expect(windowSelection?.focusOffset).toBe(testSelection.focus.offset);
      });

      test("should be able to call .focus without getting toDOMNode errors", async () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = createReactiveEditor();
        editor.children = initialValue;
        const propagatedValue = [
          { type: "block", children: [{ text: "foo" }] },
          { type: "block", children: [{ text: "bar" }] },
        ];

        const testSelection = {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };

        render(Slate, {
          props: { editor },
          slots: {
            default: h(Editable),
          },
        });

        Transforms.removeNodes(editor, { at: [0] });
        Transforms.insertNodes(editor, propagatedValue);
        await nextTick();
        DOMEditor.focus(editor); // Note: calling focus in the middle of these transformations.
        Transforms.select(editor, testSelection);
        await nextTick();
        expect(editor.selection).toEqual(testSelection);

        DOMEditor.focus(editor);

        await nextTick();
        const windowSelection = DOMEditor.getWindow(editor).getSelection();
        expect(windowSelection?.focusNode?.textContent).toBe("bar");
        expect(windowSelection?.anchorNode?.textContent).toBe("bar");
        expect(windowSelection?.anchorOffset).toBe(testSelection.anchor.offset);
        expect(windowSelection?.focusOffset).toBe(testSelection.focus.offset);
      });

      test("should not trigger onValueChange when focus is called", async () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = createReactiveEditor();
        editor.children = initialValue;

        const onChange = vi.fn();
        const onValuechange = vi.fn();
        const onSelectionchange = vi.fn();

        render(Slate, {
          props: { editor, onChange, onValuechange, onSelectionchange },
          slots: {
            default: h(Editable),
          },
        });

        expect(editor.selection).toBe(null);

        DOMEditor.focus(editor);

        expect(editor.selection).toEqual({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });

        nextTick(() => {
          expect(onChange).toHaveBeenCalled();
          expect(onSelectionchange).toHaveBeenCalled();
          expect(onValuechange).not.toHaveBeenCalled();
        });
      });
    });
  });
});
