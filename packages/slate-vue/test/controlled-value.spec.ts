import { render, fireEvent, cleanup } from "@testing-library/vue";
import { defineComponent, h, nextTick, onMounted, ref, type Ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Descendant, Editor, Transforms } from "slate";
import { HistoryEditor, withHistory } from "slate-history";
import {
  EDITOR_TO_PENDING_ACTION,
  EDITOR_TO_PENDING_DIFFS,
  IS_COMPOSING,
} from "slate-vue3/dom";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";

Object.defineProperty(HTMLElement.prototype, "isContentEditable", {
  get() {
    return (
      this.closest("[contenteditable]")?.getAttribute("contenteditable") ===
      "true"
    );
  },
});

const doc = (text: string): Descendant[] => [{ children: [{ text }] }];

const setup = () => {
  const editor = withHistory(createReactiveEditor());
  editor.children = doc("seed");
  return editor;
};

const renderView = (
  editor: ReturnType<typeof setup>,
  value: Ref<Descendant[] | undefined>,
  props: Record<string, unknown> = {},
) => {
  const App = defineComponent({
    setup() {
      return () =>
        h(
          Slate,
          { editor, value: value.value, ...props },
          { default: () => h(Editable) },
        );
    },
  });

  return render(App);
};

const renderValue = (
  editor: ReturnType<typeof setup>,
  value: Descendant[] | undefined,
) =>
  render(Slate, {
    props: { editor, value },
    slots: { default: () => h(Editable) },
  });

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("controlled value", () => {
  it("uses value on mount and synchronizes updates before paint", async () => {
    const editor = setup();
    const value = ref<Descendant[] | undefined>(doc("first"));
    const { container } = renderView(editor, value);

    expect(container.textContent).toContain("first");

    Transforms.select(editor, { path: [0, 0], offset: 2 });
    value.value = doc("first extended");
    await nextTick();

    expect(container.textContent).toContain("first extended");
    expect(editor.selection?.anchor).toEqual({ path: [0, 0], offset: 2 });
  });

  it("reports typing that follows a value passed in", async () => {
    const editor = setup();
    const value = ref<Descendant[] | undefined>(doc("a"));
    const onValueChange = vi.fn();
    renderView(editor, value, { onValueChange });

    value.value = doc("b");
    await nextTick();

    Transforms.select(editor, { path: [0, 0], offset: 1 });
    editor.insertText("c");
    await nextTick();

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(editor.children);
    expect(Editor.string(editor, [])).toBe("bc");
  });

  it("waits until composition ends and applies only the newest pending value", async () => {
    vi.useFakeTimers();
    const editor = setup();
    const value = ref<Descendant[] | undefined>(doc("initial"));
    const { container } = renderView(editor, value);

    IS_COMPOSING.set(editor, true);
    value.value = doc("first update");
    await nextTick();
    value.value = doc("latest update");
    await nextTick();

    expect(container.textContent).toContain("initial");

    await vi.advanceTimersByTimeAsync(40);
    expect(Editor.string(editor, [])).toBe("initial");

    IS_COMPOSING.set(editor, false);
    await vi.advanceTimersByTimeAsync(20);
    await nextTick();

    expect(container.textContent).toContain("latest update");
  });

  for (const pending of ["action", "diffs"] as const) {
    it(`waits for Android pending ${pending} to flush`, async () => {
      vi.useFakeTimers();
      const editor = setup();
      const value = ref<Descendant[] | undefined>(doc("initial"));
      const { container } = renderView(editor, value);

      if (pending === "action") {
        EDITOR_TO_PENDING_ACTION.set(editor, { run: () => {} });
      } else {
        EDITOR_TO_PENDING_DIFFS.set(editor, [
          { id: 0, path: [0, 0], diff: { start: 0, end: 0, text: "x" } },
        ]);
      }

      value.value = doc("external");
      await nextTick();
      expect(Editor.string(editor, [])).toBe("initial");

      EDITOR_TO_PENDING_ACTION.delete(editor);
      EDITOR_TO_PENDING_DIFFS.delete(editor);
      await vi.advanceTimersByTimeAsync(20);
      await nextTick();

      expect(container.textContent).toContain("external");
    });
  }

  it("normalizes a value passed in without reporting it", async () => {
    const editor = setup();
    const value = ref<Descendant[] | undefined>(doc("a"));
    const onValueChange = vi.fn();
    renderView(editor, value, { onValueChange });
    await nextTick();

    onValueChange.mockClear();

    value.value = [{ children: [] }] as Descendant[];
    await nextTick();

    expect(editor.children).toEqual([{ children: [{ text: "" }] }]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("lets an overridden setChildren keep stream chunks out of undo", async () => {
    const editor = setup();
    const { setChildren } = editor;
    editor.setChildren = (children) =>
      HistoryEditor.withoutSaving(editor, () => setChildren(children));

    const value = ref<Descendant[] | undefined>([
      doc("a")[0],
      doc("stream")[0],
    ]);
    renderView(editor, value);

    Transforms.select(editor, { path: [0, 0], offset: 1 });
    editor.insertText("b");
    await nextTick();

    value.value = [editor.children[0], doc("streamed")[0]];
    await nextTick();

    expect(editor.history.undos.length).toBe(1);

    editor.undo();
    expect(Editor.string(editor, [])).toBe("astreamed");
  });

  it("cancels a deferred update when unmounted", async () => {
    vi.useFakeTimers();
    const editor = setup();
    const value = ref<Descendant[] | undefined>(doc("initial"));
    const { unmount } = renderView(editor, value);

    IS_COMPOSING.set(editor, true);
    value.value = doc("external");
    await nextTick();
    unmount();
    IS_COMPOSING.set(editor, false);

    await vi.advanceTimersByTimeAsync(40);

    expect(Editor.string(editor, [])).toBe("initial");
  });
});

it("can restore a previous value object after accepting an editor echo", async () => {
  const editor = setup();
  const original = doc("a");
  const value = ref<Descendant[] | undefined>(original);
  const { container } = renderView(editor, value);

  Transforms.select(editor, { path: [0, 0], offset: 1 });
  editor.insertText("b");
  await nextTick();

  value.value = editor.children;
  await nextTick();
  value.value = original;
  await nextTick();

  expect(container.textContent).toContain("a");
  expect(Editor.string(editor, [])).toBe("a");
});

it("holds an external update from compositionstart before any compositionupdate", async () => {
  vi.useFakeTimers();
  const editor = setup();
  const value = ref<Descendant[] | undefined>(doc("initial"));
  const { getByRole } = renderView(editor, value);
  const textbox = getByRole("textbox");

  fireEvent.compositionStart(textbox, { data: "" });
  value.value = doc("external");
  await nextTick();

  expect(Editor.string(editor, [])).toBe("initial");

  await vi.advanceTimersByTimeAsync(20);
  expect(Editor.string(editor, [])).toBe("initial");

  fireEvent.compositionEnd(textbox, { data: "" });
  await vi.advanceTimersByTimeAsync(20);
  await nextTick();

  expect(Editor.string(editor, [])).toBe("external");
});

for (const controlled of [false, true]) {
  it(`registers ${
    controlled ? "controlled" : "uncontrolled"
  } onChange when mounted`, () => {
    const editor = setup();
    const onChange = vi.fn();

    const App = defineComponent({
      setup() {
        onMounted(() => {
          editor.onChange();
        });

        return () =>
          h(
            Slate,
            {
              editor,
              ...(controlled ? { value: doc("initial") } : {}),
              onChange,
            },
            { default: () => h(Editable) },
          );
      },
    });

    render(App);

    // Vue registers the listener in Slate's `onMounted`, which runs before the
    // parent component's `onMounted` in both modes.
    expect(onChange).toHaveBeenCalledTimes(1);

    onChange.mockClear();
    editor.onChange();
    expect(onChange).toHaveBeenCalledTimes(1);
  });
}

it("keeps the current callback registered when switching controlled mode", async () => {
  const editor = setup();
  const first = vi.fn();
  const second = vi.fn();
  const third = vi.fn();

  const mode = ref<"initial" | "value" | "none">("initial");
  const handler = ref(first);

  const App = defineComponent({
    setup() {
      return () => {
        const props: Record<string, unknown> = {
          editor,
          onChange: handler.value,
        };

        if (mode.value === "value") {
          props.value = editor.children;
        }

        return h(Slate, props, { default: () => h(Editable) });
      };
    },
  });

  render(App);

  mode.value = "value";
  handler.value = second;
  await nextTick();
  editor.onChange();
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledTimes(1);

  mode.value = "none";
  handler.value = third;
  await nextTick();
  editor.onChange();
  expect(second).toHaveBeenCalledTimes(1);
  expect(third).toHaveBeenCalledTimes(1);
});
