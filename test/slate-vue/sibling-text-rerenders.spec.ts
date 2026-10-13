import { Descendant, Editor, Element, Transforms } from "slate";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import {
  createReactiveEditor,
  Editable,
  RenderLeafProps,
  Slate,
} from "slate-vue3";

const setup = (
  initialValue: object[],
  isInline: (element: Element & { type?: string }) => boolean = () => false,
) => {
  const editor = createReactiveEditor();
  editor.isInline = isInline;
  editor.children = initialValue as unknown as Descendant[];

  const rendered: string[] = [];

  const renderLeaf = ({ attributes, children, text }: RenderLeafProps) => {
    rendered.push(text.text);
    return h("span", attributes, children);
  };

  const { container } = render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: h(Editable, { renderLeaf }),
    },
  });

  rendered.length = 0;
  return { editor, rendered, container };
};

describe("sibling text nodes", () => {
  it("re-render only the text that changed", async () => {
    const { editor, rendered } = setup([
      {
        type: "paragraph",
        children: [
          { text: "one", bold: true },
          { text: "two" },
          { text: "three", italic: true },
        ],
      },
    ]);

    Transforms.insertText(editor, "!", { at: { path: [0, 1], offset: 3 } });
    await nextTick();

    expect(rendered).toEqual(["two!"]);
  });

  it("re-render when the block properties change", async () => {
    const { editor, rendered } = setup([
      {
        type: "paragraph",
        children: [{ text: "one", bold: true }, { text: "two" }],
      },
    ]);

    Transforms.setNodes(editor, { type: "heading" } as Partial<Element>, {
      at: [0],
    });
    await nextTick();

    expect(rendered.sort()).toEqual(["one", "two"]);
  });

  it("re-render the old last text when a sibling is added after it", async () => {
    const { editor, rendered } = setup([
      {
        type: "paragraph",
        children: [{ text: "one", bold: true }],
      },
    ]);

    Transforms.insertNodes(
      editor,
      { text: "two", italic: true } as unknown as Descendant,
      { at: [0, 1] },
    );
    await nextTick();

    expect(rendered.sort()).toEqual(["one", "two"]);
  });

  it("keeps the line break in the last text when the block empties", async () => {
    const { editor, container } = setup(
      [
        {
          type: "paragraph",
          children: [
            { text: "" },
            { type: "link", children: [{ text: "x" }] },
            { text: "" },
          ],
        },
      ],
      (element) => element.type === "link",
    );

    Transforms.removeNodes(editor, { at: [0, 1] });
    await nextTick();

    expect(Editor.string(editor, [0])).toBe("");
    expect(
      container.querySelectorAll('[data-slate-zero-width="n"]'),
    ).toHaveLength(1);
  });
});
