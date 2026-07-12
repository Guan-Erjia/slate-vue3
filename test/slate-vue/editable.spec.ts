import { createEditor, Node, Transforms } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { describe, test, vi, expect } from "vitest";
import { Editable, RenderElementProps, Slate } from "slate-vue3";

describe("slate-react", () => {
  describe("Editable", () => {
    describe("NODE_TO_KEY logic", () => {
      test("should not unmount the node that gets split on a split_node operation", async () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = withDOM(createEditor());
        editor.children = initialValue;
        const mounts = vi.fn();

        const renderElement = ({
          attributes,
          children,
        }: RenderElementProps) => {
          mounts();
          return h("p", attributes, children);
        };
        render(Slate, {
          props: { editor, renderElement },
          slots: {
            default: h(Editable),
          },
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

        const renderElement = ({
          attributes,
          children,
        }: RenderElementProps) => {
          mounts();
          return h("p", attributes, children);
        };
        render(Slate, {
          props: { editor, renderElement },
          slots: {
            default: h(Editable),
          },
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

      Transforms.select(editor, { path: [0, 0], offset: 2 });

      await nextTick();
      expect(onSelectionchange).toHaveBeenCalled();
      // 这里的测试和 slate-react 不一致，设置 select 的时候同样应该出发 onChange
      expect(onChange).toHaveBeenCalled();
      expect(onValuechange).not.toHaveBeenCalled();
    });

    test("calls onValueChange when editor children change", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = withDOM(createEditor());
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

      Transforms.insertText(editor, "Hello word!");

      nextTick(() => {
        expect(onValuechange).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalled();
        expect(onSelectionchange).not.toHaveBeenCalled();
      });
    });

    test("calls onValueChange when editor setNodes", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = withDOM(createEditor());
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

      Transforms.setNodes(
        editor,
        { bold: true },
        {
          at: { path: [0, 0], offset: 2 },
          match: Node.isText,
          split: true,
        },
      );

      nextTick(() => {
        expect(onChange).toHaveBeenCalled();
        expect(onValuechange).toHaveBeenCalled();
        expect(onSelectionchange).not.toHaveBeenCalled();
      });
    });

    test("calls onValueChange when editor children change", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = withDOM(createEditor());
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

      Transforms.insertText(editor, "Hello word!");

      nextTick(() => {
        expect(onValuechange).toHaveBeenCalled();
        expect(onChange).toHaveBeenCalled();
        expect(onSelectionchange).not.toHaveBeenCalled();
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
