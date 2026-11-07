import { debounce } from "lodash-es";
import { Node, Point, Range } from "slate";
import * as SlateDOM from "slate-vue3/dom";
import { IS_NODE_MAP_DIRTY } from "slate-vue3/dom";
import { DOMEditor } from "slate-vue3/dom";
import { createAndroidInputManager, createReactiveEditor } from "slate-vue3";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

const env = vi.hoisted(() => ({ IS_FIREFOX: true }));

vi.mock("slate-vue3/dom", async () => {
  const actual = await vi.importActual<typeof SlateDOM>("slate-vue3/dom");
  return {
    ...actual,
    get IS_FIREFOX() {
      return env.IS_FIREFOX;
    },
  };
});

const setup = () => {
  const editor = createReactiveEditor();
  editor.children = [
    { children: [{ text: "like this:" }] },
    { children: [{ text: "" }] },
    { children: [{ text: "A wise quote." }] },
  ];
  const start = { path: [1, 0], offset: 0 };
  editor.selection = { anchor: start, focus: start };
  editor.onChange = vi.fn();
  IS_NODE_MAP_DIRTY.set(editor, false);
  vi.spyOn(DOMEditor, "getWindow").mockReturnValue(window);
  vi.spyOn(DOMEditor, "hasDOMNode").mockReturnValue(true);

  const manager = createAndroidInputManager({
    editor,
    scheduleOnDOMSelectionChange: debounce(() => {}, 0),
    onDOMSelectionChange: debounce(() => {}, 0),
  });

  const insertText = (
    data: string,
    at: Point | Range,
    inputType = "insertText",
  ) => {
    IS_NODE_MAP_DIRTY.set(editor, false);
    vi.spyOn(DOMEditor, "toSlateRange").mockReturnValue(
      Range.isRange(at) ? at : { anchor: at, focus: at },
    );
    const event = new InputEvent("beforeinput", {
      inputType,
      data,
      cancelable: true,
    });
    Object.defineProperty(event, "getTargetRanges", {
      value: () => [document.createRange()],
    });
    manager.handleDOMBeforeInput(event);
    if (!event.defaultPrevented) {
      manager.handleInput();
    }
    return event;
  };

  const blocks = () => editor.children.map((block) => Node.string(block));

  return { editor, insertText, blocks };
};

const nextBlockStart = { path: [2, 0], offset: 0 };

describe("a word Firefox commits one character at a time into an empty block", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    env.IS_FIREFOX = true;
  });

  test("keeps the rest of the word in the block after the first character renders", async () => {
    const { insertText, blocks } = setup();

    insertText("R", { path: [1, 0], offset: 0 });
    await vi.advanceTimersByTimeAsync(3);
    expect(blocks()).toEqual(["like this:", "R", "A wise quote."]);

    const event = insertText("a", nextBlockStart);
    await vi.advanceTimersByTimeAsync(3);

    expect(event.defaultPrevented).toBe(true);
    expect(blocks()).toEqual(["like this:", "Ra", "A wise quote."]);
  });

  test("leaves a character the browser placed right to the browser", async () => {
    const { insertText, blocks } = setup();

    insertText("R", { path: [1, 0], offset: 0 });
    await vi.advanceTimersByTimeAsync(3);
    const event = insertText("a", { path: [1, 0], offset: 1 });
    await vi.advanceTimersByTimeAsync(500);

    expect(event.defaultPrevented).toBe(false);
    expect(blocks()).toEqual(["like this:", "Ra", "A wise quote."]);
  });

  test("replaces a word the keyboard corrects right after typing", async () => {
    const { insertText, blocks } = setup();

    insertText("R", { path: [1, 0], offset: 0 });
    await vi.advanceTimersByTimeAsync(3);
    insertText(
      "A wise",
      {
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 1 },
      },
      "insertReplacementText",
    );
    await vi.advanceTimersByTimeAsync(500);

    expect(blocks()).toEqual(["like this:", "R", "A wise wise quote."]);
  });

  test("types where the browser says when the next character comes later", async () => {
    const { insertText, blocks } = setup();

    insertText("R", { path: [1, 0], offset: 0 });
    await vi.advanceTimersByTimeAsync(500);
    insertText("a", nextBlockStart);
    await vi.advanceTimersByTimeAsync(500);

    expect(blocks()).toEqual(["like this:", "R", "aA wise quote."]);
  });

  test("types where the browser says outside Firefox", async () => {
    env.IS_FIREFOX = false;
    const { insertText, blocks } = setup();

    insertText("R", { path: [1, 0], offset: 0 });
    await vi.advanceTimersByTimeAsync(3);
    const event = insertText("a", nextBlockStart);
    await vi.advanceTimersByTimeAsync(500);

    expect(event.defaultPrevented).toBe(false);
    expect(blocks()).toEqual(["like this:", "R", "aA wise quote."]);
  });
});
