import { sleep } from "@test-utils";
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
import { h } from "vue";

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) =>
  (element as { type?: string }).type === "link"
    ? h(
        "a",
        {
          ...attributes,
          href: "https://example.com",
        },
        children,
      )
    : h("p", attributes, children);

const copy = async (
  initialValue: Descendant[],
  select: (editor: Editor) => void,
) => {
  const editor = createReactiveEditor();
  editor.isInline = (element) => (element as { type?: string }).type === "link";
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
  select(editor);
  await sleep(0);
  const data: Record<string, string> = {};
  DOMEditor.setFragmentData(editor, {
    setData: (type: string, value: string) => {
      data[type] = value;
    },
  } as unknown as DataTransfer);
  return data;
};

const paragraphWithLink = [
  {
    children: [
      { text: "see " },
      { type: "link", children: [{ text: "the docs" }] },
      { text: " here" },
    ],
  },
] as Descendant[];

describe("copying text inside an inline", () => {
  test("keeps the inline element around the copied text in text/html", async () => {
    const data = await copy(paragraphWithLink, (editor) =>
      Transforms.select(editor, Editor.range(editor, [0, 1])),
    );
    await sleep(0);
    const html = document.createElement("div");
    html.innerHTML = data["text/html"];
    const link = html.querySelector("a");

    expect(link?.getAttribute("href")).toBe("https://example.com");
    expect(link?.textContent).toBe("the docs");
    expect(link?.querySelector("[data-slate-fragment]")).not.toBeNull();
    expect(data["text/plain"]).toBe("the docs");
  });

  test("does not wrap text copied outside any inline", async () => {
    const data = await copy(paragraphWithLink, (editor) =>
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      }),
    );
    await sleep(0);

    expect(data["text/html"]).not.toContain("<a");
  });
});
