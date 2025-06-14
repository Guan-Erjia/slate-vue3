import { render } from "@testing-library/vue";
import { describe, test, expect, vi } from "vitest";
import { createEditor, Transforms } from "slate";
import { withDOM, DOMEditor } from "slate-dom";
import { nextTick } from "vue";
import VueEditor from "./components/VueEditor.vue";

describe("slate-vue", () => {
  describe("VueEditor", () => {
    describe(".focus", () => {
      test("should set focus in top of document with no editor selection", async () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = withDOM(createEditor());
        editor.children = initialValue

        const testSelection = {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        };

        render(VueEditor, {
          props: { editor },
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
        const editor = withDOM(createEditor());
        editor.children = initialValue
        const propagatedValue = [
          { type: "block", children: [{ text: "foo" }] },
          { type: "block", children: [{ text: "bar" }] },
        ];

        const testSelection = {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 3 },
        };

        render(VueEditor, {
          props: { editor },
        });

        Transforms.removeNodes(editor, { at: [0] });
        Transforms.insertNodes(editor, propagatedValue);
        await nextTick();
        DOMEditor.focus(editor); // Note: calling focus in the middle of these transformations.
        Transforms.select(editor, testSelection);

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
        const editor = withDOM(createEditor());
        editor.children = initialValue

        const onChange = vi.fn();
        const onValueChange = vi.fn();
        const onSelectionChange = vi.fn();

        render(VueEditor, {
          props: { editor, onChange, onValueChange, onSelectionChange },
        });

        expect(editor.selection).toBe(null);

        DOMEditor.focus(editor);

        expect(editor.selection).toEqual({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });

        nextTick(() => {
          expect(onChange).toHaveBeenCalled();
          expect(onSelectionChange).toHaveBeenCalled();
          expect(onValueChange).not.toHaveBeenCalled();
        });
      });
    });
  });
});
