import { describe, expect, test } from "vitest";
import { h } from "vue";
import { render } from "@testing-library/vue";
import { DOMEditor } from "slate-vue3/dom";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";

const initialValue = [{ type: "paragraph", children: [{ text: "hello" }] }];

describe("DOMEditor.isMounted", () => {
  test("is false before the editor renders and true after", () => {
    const editor = createReactiveEditor();

    editor.children = initialValue;

    expect(DOMEditor.isMounted(editor)).toBe(false);

    render(Slate, {
      props: {
        editor,
      },
      slots: {
        default: h(Editable),
      },
    });

    expect(DOMEditor.isMounted(editor)).toBe(true);
  });
});

describe("DOMEditor.hasDOMNode", () => {
  test("returns false instead of throwing when the editor is not mounted", () => {
    const editor = createReactiveEditor();
    const target = document.createElement("div");

    expect(DOMEditor.hasDOMNode(editor, target)).toBe(false);
  });
});

describe("nested native editing hosts", () => {
  test.each(["true", "", "plaintext-only", "TRUE"])(
    "excludes contenteditable=%s only inside a non-editable island",
    (contentEditable) => {
      const editor = createReactiveEditor();
      editor.children = initialValue;

      const { container } = render(Slate, {
        props: {
          editor,
        },
        slots: {
          default: h(Editable),
        },
      });

      const outer = container.querySelector("[data-slate-editor]")!;
      const inner = document.createElement("div");
      inner.setAttribute("contenteditable", contentEditable);
      inner.textContent = "inner";
      const island = document.createElement("span");
      island.setAttribute("contenteditable", "false");
      outer.append(island, inner);

      expect(DOMEditor.hasDOMNode(editor, outer)).toBe(true);
      expect(DOMEditor.hasDOMNode(editor, inner)).toBe(true);
      expect(DOMEditor.hasDOMNode(editor, inner.firstChild!)).toBe(true);

      island.appendChild(inner);
      expect(DOMEditor.hasDOMNode(editor, inner)).toBe(false);
      expect(DOMEditor.hasEditableTarget(editor, inner.firstChild)).toBe(false);
      expect(DOMEditor.hasSelectableTarget(editor, inner.firstChild)).toBe(
        false,
      );
    },
  );

  test("owns Slate text rendered inside an editable island", () => {
    const editor = createReactiveEditor();
    editor.children = initialValue;
    const renderElement = ({ attributes, children }: any) =>
      h("div", { ...attributes, contentEditable: false }, [
        h("span", null, "Fixed header"),
        h(
          "span",
          { contentEditable: true, suppressContentEditableWarning: true },
          children,
        ),
      ]);
    const { container } = render(Slate, {
      props: {
        editor,
        renderElement,
      },
      slots: {
        default: h(Editable),
      },
    });
    const text = container.querySelector("[data-slate-string]")!.firstChild!;
    const island = container.querySelector('span[contenteditable="true"]')!;

    expect(DOMEditor.hasDOMNode(editor, text)).toBe(true);
    expect(DOMEditor.hasDOMNode(editor, island)).toBe(true);
  });

  test("keeps readonly text and non-editable descendants inside the editor", () => {
    const editor = createReactiveEditor();
    editor.children = initialValue;
    const { container } = render(
      h(
        Slate,
        { editor },
        {
          default: () => h(Editable, { readOnly: true }),
        },
      ),
    );
    const outer = container.querySelector("[data-slate-editor]")!;
    const text = container.querySelector("[data-slate-string]")!.firstChild!;
    const nonEditable = document.createElement("div");
    nonEditable.setAttribute("contenteditable", "false");
    outer.appendChild(nonEditable);

    expect(DOMEditor.hasDOMNode(editor, outer)).toBe(true);
    expect(DOMEditor.hasDOMNode(editor, text)).toBe(true);
    expect(DOMEditor.hasDOMNode(editor, nonEditable)).toBe(true);
  });

  test("keeps editable text when the editor itself is in a non-editable container", () => {
    const editor = createReactiveEditor();
    editor.children = initialValue;
    const { container } = render(
      h(
        Slate,
        { editor },
        {
          default: () => h(Editable, { readOnly: true }),
        },
      ),
    );
    const outer = container.querySelector("[data-slate-editor]")!;
    const inner = document.createElement("span");
    inner.setAttribute("contenteditable", "true");
    inner.textContent = "inside";
    outer.appendChild(inner);

    expect(DOMEditor.hasDOMNode(editor, inner.firstChild!)).toBe(true);
  });
});
