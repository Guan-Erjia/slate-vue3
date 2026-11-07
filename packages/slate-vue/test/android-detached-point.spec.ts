import { cleanup, render } from "@testing-library/vue";
import { h } from "vue";
import { afterEach, describe, expect, test } from "vitest";

Object.defineProperty(window.navigator, "userAgent", {
  configurable: true,
  value: "Mozilla/5.0 (Android 10; Mobile; rv:144.0) Gecko/144.0 Firefox/144.0",
});

// Ensure the userAgent is set before loading slate-vue3/dom.
const { createReactiveEditor, Editable, Slate } = await import("slate-vue3");

const { DOMEditor, IS_ANDROID } = await import("slate-vue3/dom");

afterEach(() => {
  cleanup();
});

const renderDetachedText = () => {
  const editor = createReactiveEditor();
  editor.children = [{ children: [{ text: "text" }] }];

  render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: () => h(Editable),
    },
  });

  const string = DOMEditor.toDOMNode(editor, editor).querySelector(
    "[data-slate-string]",
  )!;

  const text = string.firstChild!;

  if (!text) {
    throw new Error("Expected a text node inside [data-slate-string]");
  }

  string.removeChild(text);

  return { editor, text };
};

describe("a DOM point in a text node the keyboard detached on Android", () => {
  test("runs as Android", () => {
    expect(IS_ANDROID).toBe(true);
  });

  test("resolves to no point instead of throwing", () => {
    const { editor, text } = renderDetachedText();

    expect(text.parentNode).toBeNull();

    expect(
      DOMEditor.toSlatePoint(editor, [text, 2], {
        exactMatch: false,
        suppressThrow: true,
      }),
    ).toBeNull();

    expect(DOMEditor.resolveSlatePoint(editor, [text, 2])).toBeNull();
  });

  test("reports the usual error when throwing is allowed", () => {
    const { editor, text } = renderDetachedText();

    expect(() =>
      DOMEditor.toSlatePoint(editor, [text, 2], {
        exactMatch: false,
        suppressThrow: false,
      }),
    ).toThrow("Cannot resolve a Slate point from DOM point");
  });
});
