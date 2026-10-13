import { render } from "@testing-library/vue";
import { Descendant, Transforms } from "slate";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "hello" }] },
];

const App = defineComponent({
  props: ["editor"],
  setup(props) {
    return () =>
      h(
        Slate,
        { editor: props.editor },
        {
          default: () => h(Editable),
        },
      );
  },
});

describe("Slate initialValue", () => {
  test("initializes a new editor passed to an already mounted Slate", () => {
    const first = createReactiveEditor();
    const second = createReactiveEditor();
    second.children = initialValue;
    const { rerender } = render(h(App, { editor: first }));
    rerender(h(App, { editor: second }));

    expect(second.children).toEqual(initialValue);
  });

  test("does not reset the same editor on rerender", () => {
    const editor = createReactiveEditor();
    editor.children = initialValue;

    const { rerender } = render(h(App, { editor: editor }));

    Transforms.insertText(editor, " world", {
      at: { path: [0, 0], offset: 5 },
    });
    rerender(h(App, { editor: editor }));

    expect(editor.children).toEqual([
      { type: "paragraph", children: [{ text: "hello world" }] },
    ]);
  });

  test("resets the editor when Slate remounts", async () => {
    const editor = createReactiveEditor();
    editor.children = initialValue;

    const { rerender } = render(h(App, { editor: editor }));
    Transforms.insertText(editor, "!", { at: { path: [0, 0], offset: 5 } });
    rerender(h(App, { editor: editor }));
    expect(editor.children).toEqual([
      { type: "paragraph", children: [{ text: "hello!" }] },
    ]);
  });
});
