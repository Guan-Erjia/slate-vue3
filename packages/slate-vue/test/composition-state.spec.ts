import { sleep } from "@test-utils";
import { cleanup, render, fireEvent } from "@testing-library/vue";
import { Descendant, Editor, Range, Transforms } from "slate";
import {
  createReactiveEditor,
  Editable,
  RenderElementProps,
  Slate,
  useComposing,
} from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { defineComponent, h, nextTick, unref } from "vue";

afterEach(() => {
  cleanup();
});

Object.defineProperty(HTMLElement.prototype, "isContentEditable", {
  get() {
    return (
      this.closest("[contenteditable]")?.getAttribute("contenteditable") ===
      "true"
    );
  },
});

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "hello world" }] } as Descendant,
];

const setup = () => {
  const editor = createReactiveEditor();

  const composing: boolean[] = [];

  const ComposingProbe = defineComponent({
    setup() {
      const isComposing = useComposing();
      return () => {
        composing.push(unref(isComposing));
        return null;
      };
    },
  });

  const { getByRole } = render(Slate, {
    props: {
      editor,
      initialValue,
      renderElement: ({ attributes, children }: RenderElementProps) =>
        h("p", attributes, [h(ComposingProbe), children]),
    },
    slots: {
      default: () => h(Editable),
    },
  });

  const textbox = getByRole("textbox");
  const lastComposing = () => composing[composing.length - 1];

  return { editor, textbox, lastComposing };
};

const selectDOMText = (textbox: HTMLElement, start: number, end: number) => {
  const walker = document.createTreeWalker(textbox, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node && !node.textContent?.includes("hello")) {
    node = walker.nextNode();
  }

  const range = document.createRange();
  range.setStart(node!, start);
  range.setEnd(node!, end);

  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  fireEvent(document, new Event("selectionchange"));
};

describe("composition state", () => {
  test("compositionstart renders as composing before the editor reports composing", async () => {
    const { editor, textbox, lastComposing } = setup();

    await fireEvent.compositionStart(textbox, { data: "" });
    await nextTick();

    expect(lastComposing()).toBe(true);
    expect(DOMEditor.isComposing(editor)).toBe(false);
  });

  test("compositionupdate reports composing and compositionend clears both", async () => {
    const { editor, textbox, lastComposing } = setup();

    await fireEvent.compositionStart(textbox, { data: "" });
    await fireEvent.compositionUpdate(textbox, { data: "k" });
    await nextTick();

    expect(lastComposing()).toBe(true);
    expect(DOMEditor.isComposing(editor)).toBe(true);

    await fireEvent.compositionEnd(textbox, { data: "" });
    await nextTick();

    expect(lastComposing()).toBe(false);
    expect(DOMEditor.isComposing(editor)).toBe(false);
  });

  test("a keydown outside a composition clears a stuck composing state", async () => {
    const { editor, textbox, lastComposing } = setup();

    await fireEvent.compositionStart(textbox, { data: "" });
    await fireEvent.compositionUpdate(textbox, { data: "k" });
    await nextTick();

    await fireEvent.keyDown(textbox, { key: "a", isComposing: false });
    await nextTick();

    expect(lastComposing()).toBe(false);
    expect(DOMEditor.isComposing(editor)).toBe(false);
  });

  test("compositionstart deletes the text the DOM has selected, not a stale editor selection", async () => {
    const { editor, textbox } = setup();

    textbox.tabIndex = 0;
    await nextTick();

    textbox.focus();
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await sleep(10);

    selectDOMText(textbox, 6, 11);

    // The DOM selection sync is debounced/throttled: wait for it to land in the
    // value instead of relying on a fixed delay.
    await vi.waitFor(
      () => {
        const { selection } = editor;
        expect(selection && Range.isExpanded(selection)).toBe(true);
      },
      { timeout: 2000, interval: 20 },
    );

    await fireEvent.compositionStart(textbox, { data: "" });
    await nextTick();

    expect(Editor.string(editor, [])).toBe("hello ");
  });
});
