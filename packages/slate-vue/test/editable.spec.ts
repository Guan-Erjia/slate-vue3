import { Node, Transforms } from "slate";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { describe, test, vi, expect, afterEach } from "vitest";
import {
  createReactiveEditor,
  Editable,
  RenderElementProps,
  Slate,
} from "slate-vue3";
import { DOMEditor, IS_COMPOSING } from "slate-vue3/dom";

describe("slate-vue3", () => {
  describe("Editable", () => {
    describe("NODE_TO_KEY logic", () => {
      test("should not unmount the node that gets split on a split_node operation", async () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = createReactiveEditor();
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
          slots: { default: h(Editable) },
        });

        Transforms.splitNodes(editor, { at: { path: [0, 0], offset: 2 } });

        await nextTick();
        expect(mounts).toHaveBeenCalledTimes(3);
      });

      test("should not unmount the node that gets merged into on a merge_node operation", async () => {
        const initialValue = [
          { type: "block", children: [{ text: "te" }] },
          { type: "block", children: [{ text: "st" }] },
        ];
        const editor = createReactiveEditor();
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
          slots: { default: h(Editable) },
        });

        Transforms.mergeNodes(editor, { at: { path: [0, 0], offset: 0 } });

        await nextTick();
        expect(mounts).toHaveBeenCalledTimes(2);
      });
    });

    test("calls onSelectionchange when editor select change", async () => {
      const initialValue = [
        { type: "block", children: [{ text: "te" }] },
        { type: "block", children: [{ text: "st" }] },
      ];
      const editor = createReactiveEditor();
      editor.children = initialValue;

      const onChange = vi.fn();
      const onValuechange = vi.fn();
      const onSelectionchange = vi.fn();

      // slate-vue3 的 emit 名称为全小写
      render(Slate, {
        props: {
          editor,
          onChange,
          onValuechange,
          onSelectionchange,
        },
        slots: { default: h(Editable) },
      });

      Transforms.select(editor, { path: [0, 0], offset: 2 });

      await nextTick();
      expect(onSelectionchange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
      expect(onValuechange).not.toHaveBeenCalled();
    });

    test("calls onValuechange when editor children change", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = createReactiveEditor();
      editor.children = initialValue;

      const onChange = vi.fn();
      const onValuechange = vi.fn();
      const onSelectionchange = vi.fn();

      render(Slate, {
        props: { editor, onChange, onValuechange, onSelectionchange },
        slots: { default: h(Editable) },
      });

      Transforms.insertText(editor, "Hello word!");

      await nextTick();
      expect(onValuechange).toHaveBeenCalled();
      expect(onChange).toHaveBeenCalled();
      expect(onSelectionchange).not.toHaveBeenCalled();
    });

    test("calls onValuechange when editor setNodes", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = createReactiveEditor();
      editor.children = initialValue;

      const onChange = vi.fn();
      const onValuechange = vi.fn();
      const onSelectionchange = vi.fn();

      render(Slate, {
        props: { editor, onChange, onValuechange, onSelectionchange },
        slots: { default: h(Editable) },
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

      await nextTick();
      expect(onChange).toHaveBeenCalled();
      expect(onValuechange).toHaveBeenCalled();
      expect(onSelectionchange).not.toHaveBeenCalled();
    });

    describe('translate="no"', () => {
      test('should have translate="no" attribute', () => {
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        const editor = createReactiveEditor();
        editor.children = initialValue;

        const { container } = render(Slate, {
          props: { editor },
          slots: { default: h(Editable) },
        });

        const editableElement = container.querySelector("[data-slate-editor]");
        expect(editableElement?.getAttribute("translate")).toBe("no");
      });

      test("should allow override of translate attribute", () => {
        const editor = createReactiveEditor();
        const initialValue = [{ type: "block", children: [{ text: "test" }] }];
        editor.children = initialValue;

        const { container } = render(Slate, {
          props: { editor },
          slots: { default: h(Editable, { translate: "yes" }) },
        });

        const editableElement = container.querySelector("[data-slate-editor]");
        expect(editableElement?.getAttribute("translate")).toBe("yes");
      });
    });

    test("does not throw while composing when the live DOM selection has rangeCount 0", async () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];
      const editor = createReactiveEditor();
      editor.children = initialValue;

      render(Slate, {
        props: { editor },
        slots: { default: h(Editable) },
      });

      // 使用 DOMEditor 静态方法让编辑器聚焦
      DOMEditor.focus(editor);
      await nextTick();

      expect(editor.selection).not.toBeNull();
      IS_COMPOSING.set(editor, true);

      const domSelection = window.getSelection();
      expect(domSelection).not.toBeNull();
      domSelection!.removeAllRanges();
      expect(domSelection!.rangeCount).toBe(0);

      const originalCollapseToEnd =
        domSelection!.collapseToEnd.bind(domSelection);
      domSelection!.collapseToEnd = () => {
        if (domSelection!.rangeCount === 0) {
          throw new DOMException(
            "Failed to execute 'collapseToEnd' on 'Selection': there is no selection.",
            "InvalidStateError",
          );
        }
        return originalCollapseToEnd();
      };

      Transforms.select(editor, { path: [0, 0], offset: 2 });
      await nextTick();
    });

    describe("onDrop", () => {
      const initialValue = [{ type: "block", children: [{ text: "test" }] }];

      const makeDataTransfer = (text: string) =>
        ({
          getData: (type: string) => (type === "text/plain" ? text : ""),
          setData: () => {},
        }) as unknown as DataTransfer;

      const renderEditor = () => {
        const editor = createReactiveEditor();
        editor.children = initialValue;

        render(Slate, {
          props: { editor },
          slots: { default: h(Editable) },
        });

        return editor;
      };

      const dispatch = async (
        editor: ReturnType<typeof createReactiveEditor>,
        type: "dragstart" | "drop",
        text: string,
      ) => {
        const event = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: 1,
          clientY: 1,
        });
        Object.defineProperty(event, "dataTransfer", {
          value: makeDataTransfer(text),
        });

        // DOMEditor 静态方法获取编辑器根 DOM 节点
        DOMEditor.toDOMNode(editor, editor).dispatchEvent(event);
        await nextTick();
      };

      const resolveDropPositionTo = (node: globalThis.Node, offset: number) => {
        const caretRangeFromPoint = vi.fn(() => {
          const range = document.createRange();
          range.setStart(node, offset);
          range.collapse(true);
          return range;
        });
        document.caretRangeFromPoint = caretRangeFromPoint as any;
        return caretRangeFromPoint;
      };

      let outside: HTMLElement | null = null;
      const renderTextOutsideEditor = () => {
        outside = document.body.appendChild(document.createElement("p"));
        outside.textContent = "outside";
        return outside.firstChild!;
      };

      afterEach(() => {
        delete (document as Partial<Document>).caretRangeFromPoint;
        outside?.remove();
        outside = null;
      });

      test("inserts the dropped data at the drop position", async () => {
        const editor = renderEditor();
        // 使用 DOMEditor.toDOMNode 获取 DOM 节点
        const text = DOMEditor.toDOMNode(editor, editor).querySelector(
          "[data-slate-string]",
        )!.firstChild!;
        resolveDropPositionTo(text, 2);

        await dispatch(editor, "drop", "drop");

        expect(editor.children).toEqual([
          { type: "block", children: [{ text: "tedropst" }] },
        ]);
      });

      test("inserts at the selection when the drop position lies outside of the editor", async () => {
        const editor = renderEditor();
        const caretRangeFromPoint = resolveDropPositionTo(
          renderTextOutsideEditor(),
          7,
        );

        Transforms.select(editor, { path: [0, 0], offset: 2 });
        await nextTick();

        await dispatch(editor, "drop", "drop");

        expect(caretRangeFromPoint).toHaveBeenCalled();
        expect(editor.children).toEqual([
          { type: "block", children: [{ text: "tedropst" }] },
        ]);
      });

      test("inserts at the end when the drop position lies outside of the editor and nothing is selected", async () => {
        const editor = renderEditor();
        resolveDropPositionTo(renderTextOutsideEditor(), 7);
        expect(editor.selection).toBeNull();

        await dispatch(editor, "drop", "drop");

        expect(editor.children).toEqual([
          { type: "block", children: [{ text: "testdrop" }] },
        ]);
      });

      test("leaves internally dragged content in place when the drop position lies outside of the editor", async () => {
        const editor = renderEditor();
        resolveDropPositionTo(renderTextOutsideEditor(), 7);

        Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 2 },
        });
        await nextTick();

        await dispatch(editor, "dragstart", "te");

        const insertData = vi.spyOn(editor, "insertData");

        await dispatch(editor, "drop", "te");

        expect(insertData).not.toHaveBeenCalled();
        expect(editor.children).toEqual(initialValue);
      });
    });
  });
});
