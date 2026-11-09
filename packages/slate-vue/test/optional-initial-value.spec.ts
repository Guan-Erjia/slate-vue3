import { Descendant } from "slate";
import { render } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
import { h, markRaw } from "vue";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";

const value = (text: string): Descendant[] => [{ children: [{ text }] }];

describe("Slate without initialValue", () => {
  it("uses the editor's existing children", () => {
    const editor = createReactiveEditor();
    const children = value("prefilled");
    editor.children = children;

    const { container } = render(Slate, {
      props: { editor },
      slots: { default: h(Editable) },
    });

    expect(editor.children).toBe(children);
    expect(container.textContent).toContain("prefilled");
  });

  it("prefers initialValue when both are given", () => {
    const editor = createReactiveEditor();
    editor.children = value("prefilled");
    const initialValue = value("initial");

    render(Slate, {
      props: { editor, initialValue: markRaw(initialValue) },
      slots: { default: h(Editable) },
    });

    expect(editor.children).toBe(initialValue);
  });

  it("throws when the editor is empty and no initialValue is given", () => {
    const editor = createReactiveEditor();
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() =>
      render(Slate, {
        props: { editor },
        slots: { default: h(Editable) },
      }),
    ).toThrow("editor.children is empty and no initialValue was provided");

    error.mockRestore();
    warn.mockRestore();
  });
});
