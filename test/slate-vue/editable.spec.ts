import { createEditor, Text, Transforms } from "slate";
import { withDOM } from "slate-dom";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { describe, test, vi, expect } from "vitest";
import VueEditor from "./components/VueEditor.vue";
import { Editable, Slate } from "slate-vue";

describe("slate-react", () => {
  describe("Editable", () => {
    describe("NODE_TO_KEY logic", () => {
      test("should not unmount the node that gets split on a split_node operation", async () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = withDOM(createEditor());
        editor.children = initialValue;
        const mounts = vi.fn();

        render(VueEditor, {
          props: { editor, onRenderTracked: mounts },
        });

        // slate updates at next tick, so we need this to be async
        Transforms.splitNodes(editor, { at: { path: [0, 0], offset: 2 } });

        // 2 renders, one for the main element and one for the split element
        nextTick(() => {
          expect(mounts).toHaveBeenCalledTimes(3);
        });
      });

      test("should not unmount the node that gets merged into on a merge_node operation", async () => {
        const initialValue = [
          { type: "block", children: [{ text: "te" }] },
          { type: "block", children: [{ text: "st" }] },
        ];
        const editor = withDOM(createEditor());
        editor.children = initialValue;
        const mounts = vi.fn();

        render(VueEditor, {
          props: { editor, onRenderTracked: mounts },
        });

        // slate updates at next tick, so we need this to be async
        Transforms.mergeNodes(editor, { at: { path: [0, 0], offset: 0 } });

        // only 2 renders for the initial render
        expect(mounts).toHaveBeenCalledTimes(2);
      });
    });
    test("calls onSelectionChange when editor select change", async () => {
      const initialValue = [
        { type: "block", children: [{ text: "te" }] },
        { type: "block", children: [{ text: "st" }] },
      ];
      const editor = withDOM(createEditor());
      editor.children = initialValue;

      const onChange = vi.fn();
      const onValueChange = vi.fn();
      const onSelectionChange = vi.fn();

      render(VueEditor, {
        props: { editor, onChange, onValueChange, onSelectionChange },
      });

      Transforms.select(editor, { path: [0, 0], offset: 2 });

      nextTick(() => {
        expect(onSelectionChange).toHaveBeenCalled();
        // 这里的测试和 slate-react 不一致，设置 select 的时候同样应该出发 onChange
        expect(onChange).toHaveBeenCalled();
        expect(onValueChange).not.toHaveBeenCalled();
      });
    });

    test("calls onValueChange when editor children change", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = withDOM(createEditor());
      editor.children = initialValue;
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      const onSelectionChange = vi.fn();

      render(VueEditor, {
        props: { editor, onChange, onValueChange, onSelectionChange },
      });

      Transforms.insertText(editor, "Hello word!");

      nextTick(() => {
        expect(onValueChange).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalled();
        expect(onSelectionChange).not.toHaveBeenCalled();
      });
    });

    test("calls onValueChange when editor setNodes", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = withDOM(createEditor());
      editor.children = initialValue;
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      const onSelectionChange = vi.fn();

      render(VueEditor, {
        props: { editor, onChange, onValueChange, onSelectionChange },
      });

      Transforms.setNodes(
        editor,
        { bold: true },
        {
          at: { path: [0, 0], offset: 2 },
          match: Text.isText,
          split: true,
        },
      );

      nextTick(() => {
        expect(onChange).toHaveBeenCalled();
        expect(onValueChange).toHaveBeenCalled();
        expect(onSelectionChange).not.toHaveBeenCalled();
      });
    });

    test("calls onValueChange when editor children change", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = withDOM(createEditor());
      editor.children = initialValue;
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      const onSelectionChange = vi.fn();

      render(VueEditor, {
        props: { editor, onChange, onValueChange, onSelectionChange },
      });

      Transforms.insertText(editor, "Hello word!");

      nextTick(() => {
        expect(onValueChange).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalled();
        expect(onSelectionChange).not.toHaveBeenCalled();
      });
    });

    describe('translate="no"', () => {
      test('should have translate="no" attribute', () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = withDOM(createEditor());
        editor.children = initialValue;

        const { container } = render(Slate, {
          props: { editor },
          slots: {
            default: h(Editable),
          },
        });

        const editableElement = container.querySelector("[data-slate-editor]");
        expect(editableElement?.getAttribute("translate")).toBe("no");
      });

      test("should allow override of translate attribute", () => {
        const editor = withDOM(createEditor());
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        editor.children = initialValue;

        const { container } = render(Slate, {
          props: { editor },
          slots: {
            default: h(Editable, { translate: "yes" }),
          },
        });

        const editableElement = container.querySelector("[data-slate-editor]");
        expect(editableElement?.getAttribute("translate")).toBe("yes");
      });
    });
  });
});
