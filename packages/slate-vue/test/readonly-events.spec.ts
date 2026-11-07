import { h } from "vue";
import { render, fireEvent } from "@testing-library/vue";
import { describe, expect, test, vi } from "vitest";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";

import type { Editor } from "slate";

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

const events = [
  ["onClick", fireEvent.click],
  ["onCopy", fireEvent.copy],
  [
    "onBeforeinput",
    (element: HTMLElement, event: Record<string, unknown>) =>
      fireEvent(
        element,
        new InputEvent("beforeinput", {
          ...event,
          bubbles: true,
          inputType: "insertText",
          data: "X",
        }),
      ),
  ],
  ["onFocus", fireEvent.focus],
  ["onBlur", fireEvent.blur],
  ["onKeydown", fireEvent.keyDown],
  ["onPaste", fireEvent.paste],
  ["onCut", fireEvent.cut],
  ["onDragstart", fireEvent.dragStart],
  ["onDragend", fireEvent.dragEnd],
  ["onDragover", fireEvent.dragOver],
  ["onDrop", fireEvent.drop],
  ["onInput", fireEvent.input],
  ["onCompositionstart", fireEvent.compositionStart],
  ["onCompositionupdate", fireEvent.compositionUpdate],
  ["onCompositionend", fireEvent.compositionEnd],
] as const;

const renderReadOnlyEditor = (
  editor: Editor,
  initialValue: Editor["children"],
  editableProps: Record<string, any> = {},
) => {
  editor.children = initialValue;
  render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: () =>
        h(Editable, {
          readOnly: true,
          ...editableProps,
        }),
    },
  });

  return DOMEditor.toDOMNode(editor, editor);
};

describe("readOnly event handlers", () => {
  test.each(events)(
    "%s reaches the caller without editing",
    async (name, fire) => {
      const editor = createReactiveEditor();
      const handler = vi.fn();
      const children = [{ children: [{ text: "hello" }] }];

      const element = renderReadOnlyEditor(editor, children, {
        tabIndex: 0,
        [name]: handler,
      });

      await fire(element, {
        key: "Backspace",
        data: "X",
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(editor.children).toEqual(children);
      expect(editor.operations).toEqual([]);
      expect(DOMEditor.isComposing(editor)).toBe(false);
      expect(element.tabIndex).toBe(0);
    },
  );

  test("does not make readOnly viewers focusable by default", () => {
    const editor = createReactiveEditor();

    const element = renderReadOnlyEditor(editor, [
      { children: [{ text: "hello" }] },
    ]);

    expect(element.hasAttribute("tabindex")).toBe(false);
  });
});
