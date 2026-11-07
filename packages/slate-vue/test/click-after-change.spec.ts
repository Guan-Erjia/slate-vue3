import { cleanup, render, fireEvent } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { afterEach, describe, it, expect } from "vitest";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";
import { Editor, Element, Transforms, type Descendant } from "slate";

describe("clicking inside the editor", () => {
  afterEach(() => {
    cleanup();
  });

  it("ignores a click whose handler already replaced the clicked element", async () => {
    const editor = createReactiveEditor();

    const initialValue: Descendant[] = [
      { type: "code", lang: "js", children: [{ text: "x" }] } as Element,
    ];

    editor.children = initialValue;
    const renderElement = ({ attributes, children, element }: any) =>
      h("div", attributes, [
        h("span", { contenteditable: "false" }, [
          h(
            "button",
            {
              type: "button",
              onClick: () =>
                Transforms.setNodes(
                  editor,
                  { lang: "ts" } as Partial<Element>,
                  {
                    at: DOMEditor.findPath(editor, element),
                  },
                ),
            },
            element.lang,
          ),
        ]),
        children,
      ]);

    const { getByRole } = render(Slate, {
      props: {
        editor,
        renderElement,
      },
      slots: {
        default: () => h(Editable, {}),
      },
    });

    await fireEvent.click(getByRole("button"));
    await nextTick();

    expect((Editor.node(editor, [0])[0] as any).lang).toBe("ts");
  });

  it("ignores a click whose handler already replaced the clicked text", async () => {
    const editor = createReactiveEditor();

    const initialValue: Descendant[] = [
      { children: [{ text: "ab" }] } as Element,
    ];

    editor.children = initialValue;

    const renderLeaf = ({ attributes, children }: any) =>
      h("span", attributes, [
        children,
        h("span", { contenteditable: false }, [
          h(
            "button",
            {
              type: "button",
              onClick: () =>
                Transforms.insertText(editor, "c", {
                  at: { path: [0, 0], offset: 2 },
                }),
            },
            "suggest",
          ),
        ]),
      ]);

    const { getByRole } = render(Slate, {
      props: {
        editor,
        renderLeaf,
      },
      slots: {
        default: () => h(Editable),
      },
    });

    await fireEvent.click(getByRole("button"));
    await nextTick();

    expect(Editor.string(editor, [])).toBe("abc");
  });
});
