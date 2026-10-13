import { debounce } from "lodash-es";
import { Node } from "slate";
import { createAndroidInputManager, createReactiveEditor } from "slate-vue3";
import {
  DOMEditor,
  EDITOR_TO_PENDING_DIFFS,
  IS_COMPOSING,
  IS_NODE_MAP_DIRTY,
} from "slate-vue3/dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const setup = (text = "中文输入") => {
  const editor = createReactiveEditor();
  editor.children = [{ children: [{ text }] }];
  const point = { path: [0, 0], offset: text.length };
  editor.selection = { anchor: point, focus: point };
  editor.onChange = vi.fn();
  IS_NODE_MAP_DIRTY.set(editor, true);
  vi.spyOn(DOMEditor, "getWindow").mockReturnValue(window);

  const manager = createAndroidInputManager({
    editor,
    scheduleOnDOMSelectionChange: debounce(() => {}, 0),
    onDOMSelectionChange: debounce(() => {}, 0),
  });

  const beforeInput = (inputType: string, data: string | null = null) => {
    const event = new InputEvent("beforeinput", { inputType, data });
    Object.defineProperty(event, "getTargetRanges", {
      value: () => [document.createRange()],
    });
    manager.handleDOMBeforeInput(event);
  };

  return { editor, manager, beforeInput };
};

describe("Android input flushing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("flushes each backward deletion without another input event", async () => {
    const { editor, manager, beforeInput } = setup();

    for (const text of ["中文输", "中文"]) {
      beforeInput("deleteContentBackward");
      manager.handleInput();
      await vi.advanceTimersByTimeAsync(0);

      expect(Node.string(editor)).toBe(text);
      expect(manager.hasPendingChanges()).toBe(false);
    }
  });

  test("notifies once when flushing a deletion with unchanged marks", async () => {
    const { editor, manager, beforeInput } = setup();
    beforeInput("deleteContentBackward");
    manager.flush();
    await Promise.resolve();

    expect(Node.string(editor)).toBe("中文输");
    expect(editor.onChange).toHaveBeenCalledTimes(1);
  });

  test("restores the pending user marks after deleting text", async () => {
    const { editor, manager, beforeInput } = setup();
    const marks = { bold: true };
    editor.marks = marks;
    beforeInput("deleteContentBackward");
    manager.flush();
    await Promise.resolve();

    expect(editor.marks).toBe(marks);
    expect(Node.string(editor)).toBe("中文输");
  });

  test("flushes consecutive deletions merged before the timer runs", async () => {
    const { editor, manager, beforeInput } = setup();
    beforeInput("deleteContentBackward");
    const point = { path: [0, 0], offset: 3 };
    editor.selection = { anchor: point, focus: point };
    beforeInput("deleteContentBackward");
    await vi.advanceTimersByTimeAsync(0);

    expect(Node.string(editor)).toBe("中文");
    expect(EDITOR_TO_PENDING_DIFFS.get(editor)).toEqual([]);
    expect(manager.hasPendingChanges()).toBe(false);
  });

  test("flushes a backward deletion with an expanded target range", async () => {
    const { editor, manager, beforeInput } = setup();
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 4 },
    };
    beforeInput("deleteContentBackward");
    manager.handleInput();
    await vi.advanceTimersByTimeAsync(0);

    expect(Node.string(editor)).toBe("中文");
    expect(manager.hasPendingChanges()).toBe(false);
  });

  test("still flushes typed text when a selection action is pending", async () => {
    const { editor, manager, beforeInput } = setup("word");
    beforeInput("insertText", "Z");
    expect(manager.hasPendingAction()).toBe(true);
    manager.handleInput();

    expect(Node.string(editor)).toBe("wordZ");
    expect(manager.hasPendingChanges()).toBe(false);
  });

  test("keeps typed text without a pending action until FLUSH_DELAY", async () => {
    const { editor, manager, beforeInput } = setup("word");
    const point = { path: [0, 0], offset: 4 };
    const range = { anchor: point, focus: point };
    editor.selection = null;
    IS_NODE_MAP_DIRTY.set(editor, false);
    vi.spyOn(DOMEditor, "toSlateRange").mockReturnValue(range);

    beforeInput("insertText", "Z");
    expect(manager.hasPendingAction()).toBe(false);
    manager.handleInput();
    const after = { path: [0, 0], offset: 5 };
    manager.handleUserSelect({ anchor: after, focus: after });
    await vi.advanceTimersByTimeAsync(199);

    expect(Node.string(editor)).toBe("word");
    expect(manager.hasPendingDiffs()).toBe(true);

    await vi.advanceTimersByTimeAsync(1);

    expect(Node.string(editor)).toBe("wordZ");
    expect(manager.hasPendingChanges()).toBe(false);
  });

  test("clears superseded scheduled flushes before applying a later selection", async () => {
    const { editor, manager } = setup("word");
    const originalSelection = editor.selection;
    manager.scheduleFlush();
    manager.scheduleFlush();
    manager.flush();

    const point = { path: [0, 0], offset: 0 };
    manager.handleUserSelect({ anchor: point, focus: point });
    await vi.advanceTimersByTimeAsync(0);

    expect(editor.selection).toEqual(originalSelection);
    manager.flush();
    expect(editor.selection).toEqual({ anchor: point, focus: point });
  });

  test("clears a scheduled flush when scheduling an action", async () => {
    const { editor, manager, beforeInput } = setup("word");
    manager.scheduleFlush();
    beforeInput("insertParagraph");
    manager.flush();
    const selectionAfterAction = editor.selection;

    const point = { path: [0, 0], offset: 0 };
    manager.handleUserSelect({ anchor: point, focus: point });
    await vi.advanceTimersByTimeAsync(0);

    expect(editor.selection).toEqual(selectionAfterAction);
    await vi.advanceTimersByTimeAsync(200);
    expect(editor.selection).toEqual({ anchor: point, focus: point });
  });

  test("preserves a live composition in an empty leaf until it ends", async () => {
    const { editor, manager, beforeInput } = setup("");
    IS_COMPOSING.set(editor, true);
    beforeInput("insertCompositionText", "中");
    await vi.advanceTimersByTimeAsync(500);

    expect(Node.string(editor)).toBe("");
    expect(manager.hasPendingChanges()).toBe(true);

    IS_COMPOSING.set(editor, false);
    manager.flush();
    await Promise.resolve();

    expect(Node.string(editor)).toBe("中");
    expect(manager.hasPendingChanges()).toBe(false);
  });
});
