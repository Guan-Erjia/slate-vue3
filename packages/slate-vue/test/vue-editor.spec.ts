import { createEditor, Editor, Transforms } from "slate";
import { render } from "@testing-library/vue";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { h, nextTick } from "vue";
import { DOMEditor } from "slate-vue3/dom";

describe("slate-react", () => {
  describe("DOMEditor", () => {
    describe(".focus", () => {
      test("should set focus in top of document with no editor selection", async () => {
        const editor = createReactiveEditor();
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        editor.children = initialValue;
        const testSelection = {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        };

        render(Slate, {
          props: {
            editor,
          },
          slots: {
            default: h(Editable),
          },
        });

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
        const editor = createReactiveEditor();
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
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
          props: {
            editor,
          },
          slots: {
            default: h(Editable),
          },
        });

        Transforms.removeNodes(editor, { at: [0] });
        Transforms.insertNodes(editor, propagatedValue);
        DOMEditor.focus(editor); // Note: calling focus in the middle of these transformations.
        Transforms.select(editor, testSelection);

        await nextTick();
        expect(editor.selection).toEqual(testSelection);

        DOMEditor.focus(editor);

        const windowSelection = DOMEditor.getWindow(editor).getSelection();
        expect(windowSelection?.focusNode?.textContent).toBe("bar");
        expect(windowSelection?.anchorNode?.textContent).toBe("bar");
        expect(windowSelection?.anchorOffset).toBe(testSelection.anchor.offset);
        expect(windowSelection?.focusOffset).toBe(testSelection.focus.offset);
      });

      test("should not trigger onValueChange when focus is called", async () => {
        const editor = createReactiveEditor();
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        editor.children = initialValue;
        const onChange = vi.fn();
        const onValuechange = vi.fn();
        const onSelectionchange = vi.fn();

        render(Slate, {
          props: {
            editor,
            onChange,
            onValuechange,
            onSelectionchange,
          },
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
        await nextTick();

        expect(onChange).toHaveBeenCalled();
        expect(onSelectionchange).toHaveBeenCalled();
        expect(onValuechange).not.toHaveBeenCalled();
      });
    });

    describe(".findEventRange", () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];

      let outside: HTMLElement | null = null;

      afterEach(() => {
        outside?.remove();
        outside = null;
      });

      const renderEditor = () => {
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
        return editor;
      };

      const renderEditorAndOutsideTarget = () => {
        const editor = renderEditor();
        outside = document.body.appendChild(document.createElement("p"));
        const event = { clientX: 1, clientY: 1, target: outside };

        return { editor, event };
      };

      // Calls `findEventRange` after the block changed but before React
      // re-rendered it, so its DOM element still maps to the replaced node.
      const findEventRangeOnStaleTarget = async (
        editor: Editor,
        options?: { suppressThrow: true },
      ) => {
        const target = DOMEditor.toDOMNode(editor, editor.children[0]);
        const event = { clientX: 1, clientY: 1, target };

        Transforms.setNodes(editor, { type: "other" } as any, { at: [0] });
        const range = DOMEditor.findEventRange(editor, event, options);

        return range;
      };

      test("should return null for a target outside of the editor with suppressThrow", () => {
        const { editor, event } = renderEditorAndOutsideTarget();

        expect(
          DOMEditor.findEventRange(editor, event, { suppressThrow: true }),
        ).toBeNull();
      });

      test("should throw for a target outside of the editor without suppressThrow", () => {
        const { editor, event } = renderEditorAndOutsideTarget();

        expect(() => DOMEditor.findEventRange(editor, event)).toThrow(
          "Cannot resolve a Slate node from DOM node",
        );
      });

      test("should return null for a target with a stale node with suppressThrow", async () => {
        const editor = renderEditor();

        expect(
          await findEventRangeOnStaleTarget(editor, { suppressThrow: true }),
        ).toBeNull();
      });

      test("should throw for a target with a stale node without suppressThrow", async () => {
        const editor = renderEditor();

        await expect(findEventRangeOnStaleTarget(editor)).rejects.toThrow(
          "Unable to find the path for Slate node",
        );
      });
    });
  });
});
