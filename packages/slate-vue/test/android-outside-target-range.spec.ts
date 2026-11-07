import { debounce } from "lodash-es";
import { Node } from "slate";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createAndroidInputManager, createReactiveEditor } from "slate-vue3";
import { DOMEditor, IS_NODE_MAP_DIRTY } from "slate-vue3/dom";

const setup = (...texts: string[]) => {
  const editor = createReactiveEditor();

  editor.children = texts.map((text) => ({ children: [{ text }] }));

  const last = texts.length - 1;
  const caret = { path: [last, 0], offset: texts[last].length };

  editor.selection = { anchor: caret, focus: caret };
  editor.onChange = vi.fn();

  IS_NODE_MAP_DIRTY.set(editor, false);

  const outside = document.createElement("p");
  const outsideRange = document.createRange();
  outsideRange.setStart(outside, 0);

  vi.spyOn(DOMEditor, "getWindow").mockReturnValue(window);

  vi.spyOn(DOMEditor, "hasDOMNode").mockImplementation(
    (_, node) => node !== outside,
  );

  vi.spyOn(DOMEditor, "toSlateRange").mockImplementation((_, range) =>
    range === outsideRange ? null : { anchor: caret, focus: caret },
  );

  const manager = createAndroidInputManager({
    editor,
    scheduleOnDOMSelectionChange: debounce(() => {}, 0),
    onDOMSelectionChange: debounce(() => {}, 0),
  });

  const insertOutside = (data: string) => {
    const event = new InputEvent("beforeinput", {
      inputType: "insertText",
      data,
      cancelable: true,
    });

    Object.defineProperty(event, "getTargetRanges", {
      value: () => [outsideRange],
    });

    manager.handleDOMBeforeInput(event);

    return event;
  };

  const blocks = () => editor.children.map((block) => Node.string(block));

  return { editor, insertOutside, blocks };
};

describe("a keyboard replacement whose target range is outside the editor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("replaces the word before the caret", async () => {
    const { editor, insertOutside } = setup("This is rathe");

    const event = insertOutside("rather ");
    await vi.advanceTimersByTimeAsync(500);

    expect(Node.string(editor)).toBe("This is rather ");
    expect(event.defaultPrevented).toBe(true);
  });

  test("inserts at the caret when the replacement starts with another letter", async () => {
    const { editor, insertOutside } = setup("This is rathe");

    insertOutside("xyz ");
    await vi.advanceTimersByTimeAsync(500);

    expect(Node.string(editor)).toBe("This is rathexyz ");
  });

  test("inserts at the caret after a space", async () => {
    const { editor, insertOutside } = setup("This is ");

    insertOutside("is ");
    await vi.advanceTimersByTimeAsync(500);

    expect(Node.string(editor)).toBe("This is is ");
  });

  test("inserts at the caret at the start of a block", async () => {
    const { insertOutside, blocks } = setup("like", "");

    insertOutside("likes ");
    await vi.advanceTimersByTimeAsync(500);

    expect(blocks()).toEqual(["like", "likes "]);
  });

  test("inserts at the caret at the start of the document", async () => {
    const { editor, insertOutside } = setup("");

    insertOutside("a ");
    await vi.advanceTimersByTimeAsync(500);

    expect(Node.string(editor)).toBe("a ");
  });

  test("inserts a lone space at the caret", async () => {
    const { editor, insertOutside } = setup("This is rathe");

    insertOutside(" ");
    await vi.advanceTimersByTimeAsync(500);

    expect(Node.string(editor)).toBe("This is rathe ");
  });

  test("leaves the text alone for an empty insert", async () => {
    const { editor, insertOutside } = setup("This is rathe");

    insertOutside("");
    await vi.advanceTimersByTimeAsync(500);

    expect(Node.string(editor)).toBe("This is rathe");
  });
});
