import { Transforms } from "slate";
import { render } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { h, nextTick } from "vue";

describe("placeholder accessibility", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const renderEditor = (props?: any) => {
    const editor = createReactiveEditor();
    editor.children = [{ children: [{ text: "" }] }];
    const { container } = render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: h(Editable, {
          placeholder: "Type here",
          ...props,
        }),
      },
    });

    vi.runAllTimers();
    const root = container.querySelector("[data-slate-editor]")!;
    return { editor, container, root };
  };

  it("exposes the placeholder as aria-placeholder on the textbox", () => {
    const { root } = renderEditor();

    expect(root.getAttribute("aria-placeholder")).toBe("Type here");
  });

  it("hides the visual placeholder from assistive technology", async () => {
    const { container } = renderEditor();
    await nextTick();
    const placeholder = container.querySelector("[data-slate-placeholder]");
    expect(placeholder?.getAttribute("aria-hidden")).toBe("true");
  });

  it("removes aria-placeholder once the editor has content", async () => {
    const { editor, root } = renderEditor();

    Transforms.insertText(editor, "a", { at: { path: [0, 0], offset: 0 } });
    await nextTick();
    expect(root.hasAttribute("aria-placeholder")).toBe(false);
  });

  it("lets an explicit aria-placeholder prop win", () => {
    const { root } = renderEditor({ "aria-placeholder": "Write a comment" });

    expect(root.getAttribute("aria-placeholder")).toBe("Write a comment");
  });

  it("forwards other aria attributes to the editor root", () => {
    const { root } = renderEditor({
      "aria-label": "Comment",
      "aria-autocomplete": "list",
    });

    expect(root.getAttribute("aria-label")).toBe("Comment");
    expect(root.getAttribute("aria-autocomplete")).toBe("list");
  });
});
