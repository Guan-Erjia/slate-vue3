import { render } from "@testing-library/vue";
import { Descendant, Node, Path, Point, Transforms } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { describe, expect, test, vi } from "vitest";
import { h, nextTick } from "vue";

vi.mock("slate-vue3/dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("slate-vue3/dom")>();
  return {
    ...actual,
    HAS_BEFORE_INPUT_SUPPORT: true,
  };
});

Object.defineProperty(HTMLElement.prototype, "isContentEditable", {
  get() {
    return (
      this.closest("[contenteditable]")?.getAttribute("contenteditable") ===
      "true"
    );
  },
});

const chromeCaret = (editor: DOMEditor): Point => {
  const { anchor } = editor.selection!;
  const text = Node.get(editor, anchor.path) as { text: string };
  const next = Path.next(anchor.path);

  return text.text.endsWith("\n") &&
    anchor.offset === text.text.length &&
    Node.has(editor, next)
    ? { path: next, offset: 0 }
    : anchor;
};

describe("typing after a soft break at the end of a leaf", () => {
  test("keeps the typed characters in order", async () => {
    const addEventListener = HTMLElement.prototype.addEventListener;
    let onBeforeInput: ((event: unknown) => void) | undefined;
    const spy = vi
      .spyOn(HTMLElement.prototype, "addEventListener")
      .mockImplementation(function (
        this: HTMLElement,
        type: string,
        listener: any,
        options?: any,
      ) {
        if (type === "beforeinput") {
          onBeforeInput = listener;
        }
        return addEventListener.call(this, type, listener, options);
      });

    const editor = createReactiveEditor();
    const initialValue = [
      { children: [{ text: "rich\n", bold: true }, { text: " text" }] },
    ] as Descendant[];

    editor.children = initialValue;

    render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: h(Editable),
      },
    });
    spy.mockRestore();

    Transforms.select(editor, { path: [0, 0], offset: 5 });

    await nextTick();
    const editable = DOMEditor.toDOMNode(editor, editor);

    for (const data of ["1", "2", "3"]) {
      const [node, offset] = DOMEditor.toDOMPoint(editor, chromeCaret(editor));
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset);

      onBeforeInput!({
        isTrusted: true,
        inputType: "insertText",
        data,
        target: editable,
        getTargetRanges: () => [range],
        preventDefault: () => {},
        stopImmediatePropagation: () => {},
      });
    }

    expect(Node.string(editor)).toBe("rich\n123 text");
  });
});
