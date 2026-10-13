import * as SlateDOM from "slate-vue3/dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render } from "@testing-library/vue";
import { nextTick, h } from "vue";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";

vi.mock("slate-vue3/dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("slate-vue3/dom")>();
  return {
    ...actual,
    HAS_BEFORE_INPUT_SUPPORT: true,
    IS_WEBKIT: true,
    IS_CHROME: false,
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

afterEach(() => vi.restoreAllMocks());

const scenarios = [
  { key: "Backspace", which: 8, method: "deleteBackward" as const, offset: 0 },
  { key: "Delete", which: 46, method: "deleteForward" as const, offset: 5 },
];

for (const scenario of scenarios) {
  describe(`${scenario.key} at the document boundary`, () => {
    const setup = async (guard?: string) => {
      if (guard === "android") {
        vi.mocked(SlateDOM).IS_WEBKIT = false;
        vi.mocked(SlateDOM).IS_ANDROID = true;
      }

      const editor = createReactiveEditor();
      editor[scenario.method] = vi.fn();

      editor.children = [{ children: [{ text: "hello" }] }];

      render(Slate, {
        props: {
          editor,
        },
        slots: {
          default: h(Editable, {
            readOnly: guard === "readonly",
            onKeyDown:
              guard === "handled"
                ? (event: KeyboardEvent) => event.preventDefault()
                : undefined,
          }),
        },
      });

      await nextTick();

      const anchor = {
        path: [0, 0],
        offset: guard === "inside" ? 2 : scenario.offset,
      };
      editor.select(
        guard === "expanded"
          ? { anchor, focus: { path: [0, 0], offset: 3 } }
          : anchor,
      );

      if (guard === "composing") SlateDOM.IS_COMPOSING.set(editor, true);

      await nextTick();

      const allowed = fireEvent.keyDown(
        SlateDOM.DOMEditor.toDOMNode(editor, editor),
        {
          key: scenario.key,
          which: scenario.which,
          isComposing: guard === "composing",
        },
      );

      return { editor, allowed };
    };

    test("calls the override once and prevents the native default", async () => {
      const { editor, allowed } = await setup();
      expect(editor[scenario.method]).toHaveBeenCalledTimes(1);
      expect(editor[scenario.method]).toHaveBeenCalledWith("character");
      expect(allowed).toBe(false);
    });

    test.each([
      "inside",
      "expanded",
      "composing",
      "handled",
      "readonly",
      "android",
    ])("does not intercept the %s path", async (guard) => {
      const { editor } = await setup(guard);
      expect(editor[scenario.method]).not.toHaveBeenCalled();
    });
  });
}
