import { Descendant, Editor } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { describe, expect, test } from "vitest";
import { render } from "@testing-library/vue";
import { h } from "vue";
import { DOMEditor } from "slate-vue3/dom";
import { sleep } from "@test-utils";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "before the void" }] } as Descendant,
  { type: "image", children: [{ text: "" }] } as Descendant,
];

const renderEditor = () => {
  const editor = createReactiveEditor();
  const { isVoid } = editor;
  editor.isVoid = (element) =>
    (element as { type?: string }).type === "image" || isVoid(element);

  editor.children = initialValue;

  const renderElement = ({ attributes, children, element }: any) => {
    return (element as { type?: string }).type === "image"
      ? h("div", attributes, [
          h("div", {
            contenteditable: false,
            ["data-testid"]: "void-content",
          }),
          children,
        ])
      : h("p", attributes, children);
  };

  const { container } = render(Slate, {
    props: {
      editor,
      renderElement,
    },
    slots: {
      default: h(Editable),
    },
  });

  return { editor, container };
};

describe("ReactEditor.toSlateRange", () => {
  test("keeps a forward selection that ends inside a block void", async () => {
    const { editor, container } = renderEditor();

    await sleep(0);
    const text = container.querySelector("[data-slate-string]")!.firstChild!;
    const voidContent = container.querySelector(
      '[data-testid="void-content"]',
    )!;
    const domRange = document.createRange();
    domRange.setStart(text, 0);
    domRange.setEnd(voidContent, 0);

    const range = DOMEditor.toSlateRange(editor, domRange, {
      exactMatch: false,
      suppressThrow: false,
    });

    expect(range).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });
});
