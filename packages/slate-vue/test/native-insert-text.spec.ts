import { render, fireEvent } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor, IS_NODE_MAP_DIRTY } from "slate-vue3/dom";
import { Node, type NodeEntry, Transforms } from "slate";

vi.mock("slate-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("slate-vue3/dom")>()),
  HAS_BEFORE_INPUT_SUPPORT: true,
}));

Object.defineProperty(HTMLElement.prototype, "isContentEditable", {
  configurable: true,
  get() {
    return (
      this.closest("[contenteditable]")?.getAttribute("contenteditable") ===
      "true"
    );
  },
});

const decorate = ([node, path]: NodeEntry) =>
  Node.isText(node)
    ? [
        {
          anchor: { path, offset: 0 },
          focus: { path, offset: 3 },
          highlight: true,
        },
      ]
    : [];

const setup = async (decorated: boolean, offset: number) => {
  let beforeInput: EventListener | undefined;

  const addEventListener = HTMLElement.prototype.addEventListener;

  const listenerSpy = vi
    .spyOn(HTMLElement.prototype, "addEventListener")
    .mockImplementation(function (
      this: HTMLElement,
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === "beforeinput" && typeof listener === "function") {
        beforeInput = listener;
      }

      return addEventListener.call(this, type, listener, options);
    });

  const editor = createReactiveEditor();

  const insertText = editor.insertText;

  editor.insertText = (text, options) => {
    if (!/[A-Z]/.test(text)) {
      insertText(text, options);
    }
  };
  editor.children = [{ children: [{ text: "abcdef" }] }];
  render(Slate, {
    props: {
      editor,
      decorate: decorated ? decorate : undefined,
    },
    slots: {
      default: () => h(Editable, {}),
    },
  });

  listenerSpy.mockRestore();

  Transforms.select(editor, {
    path: [0, 0],
    offset,
  });

  await nextTick();

  const editable = DOMEditor.toDOMNode(editor, editor);

  const nativeInput = async (leaf: number, domOffset: number, data: string) => {
    const node = editable.querySelectorAll("[data-slate-string]")[leaf]
      .firstChild!;

    if (!(node instanceof window.Text)) {
      throw new Error("Expected a DOM text node");
    }

    window.getSelection()!.collapse(node, domOffset);

    const range = document.createRange();
    range.setStart(node, domOffset);
    range.collapse(true);

    const preventDefault = vi.fn();

    beforeInput!.call(editable, {
      isTrusted: true,
      target: editable,
      inputType: "insertText",
      data,
      getTargetRanges: () => [range],
      preventDefault,
    } as unknown as InputEvent);

    if (!preventDefault.mock.calls.length) {
      node.insertData(domOffset, data);
      window.getSelection()!.collapse(node, domOffset + data.length);
    }

    await fireEvent(
      editable,
      new InputEvent("input", {
        inputType: "insertText",
        data,
        bubbles: true,
      }),
    );

    await nextTick();
  };

  return {
    editor,
    editable,
    nativeInput,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("native beforeinput", () => {
  test("removes a rejected native insertion from an undecorated text node", async () => {
    const { editor, editable, nativeInput } = await setup(false, 6);

    await nativeInput(0, 6, "X");

    expect(Node.string(editor)).toBe("abcdef");
    expect(editable.textContent).toBe("abcdef");
  });

  test("removes a rejected insertion from the actual leaf at a decoration boundary", async () => {
    const { editor, editable, nativeInput } = await setup(true, 3);

    await nativeInput(1, 0, "X");

    expect(Node.string(editor)).toBe("abcdef");
    expect(editable.textContent).toBe("abcdef");

    await nativeInput(1, 0, "g");

    expect(Node.string(editor)).toBe("abcgdef");
    expect(editable.textContent).toBe("abcgdef");
  });

  test("does not resolve a native insertion point while the node map is dirty", async () => {
    const { editor, nativeInput } = await setup(false, 6);

    IS_NODE_MAP_DIRTY.set(editor, true);

    const toDOMPoint = vi.spyOn(DOMEditor, "toDOMPoint");

    await nativeInput(0, 6, "X");

    expect(toDOMPoint).not.toHaveBeenCalled();
  });
});
