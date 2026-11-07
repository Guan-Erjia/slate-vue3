import { render } from "@testing-library/vue";
import { Descendant, Editor, Transforms } from "slate";
import {
  createReactiveEditor,
  Editable,
  RenderElementProps,
  Slate,
} from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { describe, expect, test } from "vitest";
import { h, nextTick } from "vue";

type Mention = { type: "mention"; character: string };

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) =>
  (element as Partial<Mention>).type === "mention"
    ? h("span", { ...attributes, contenteditable: false }, [
        h("div", `@${(element as unknown as Mention).character}`),
        children,
      ])
    : h("p", attributes, children);

const copyAll = async (initialValue: Descendant[]) => {
  const editor = createReactiveEditor();
  editor.isInline = (element) =>
    (element as Partial<Mention>).type === "mention";
  editor.isVoid = (element) => (element as Partial<Mention>).type === "mention";
  editor.children = initialValue;

  render(Slate, {
    props: {
      editor,
      renderElement,
    },
    slots: {
      default: h(Editable),
    },
  });

  Transforms.select(editor, Editor.range(editor, []));

  await nextTick();

  const data: Record<string, string> = {};
  DOMEditor.setFragmentData(editor, {
    setData: (type: string, value: string) => {
      data[type] = value;
    },
  } as unknown as DataTransfer);
  return data;
};

describe("copying inline voids as plain text", () => {
  test("keeps a mention on the same line as the text around it", async () => {
    const data = await copyAll([
      {
        children: [
          { text: "like " },
          { type: "mention", character: "R2-D2", children: [{ text: "" }] },
          { text: " or " },
          { type: "mention", character: "Mace", children: [{ text: "" }] },
          { text: "!" },
        ],
      },
      { children: [{ text: "next" }] },
    ] as Descendant[]);

    expect(data["text/plain"]).toBe("like @R2-D2 or @Mace!\nnext\n");
  });
});
