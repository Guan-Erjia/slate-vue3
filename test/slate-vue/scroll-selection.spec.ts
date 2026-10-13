import { Transforms } from "slate";
import { expect, test, vi } from "vitest";
import { render } from "@testing-library/vue";
import { h, nextTick } from "vue";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import { DOMEditor } from "slate-vue3/dom";

const setup = async () => {
  const editor = createReactiveEditor();
  const scrollSelectionIntoView = vi.fn();

  const initialValue = [
    { type: "paragraph", children: [{ text: "" }] },
    { type: "paragraph", children: [{ text: "" }] },
  ];

  editor.children = initialValue;

  render(Slate, {
    props: {
      editor,
    },
    slots: {
      default: h(Editable, {
        scrollSelectionIntoView,
      }),
    },
  });

  await nextTick();

  DOMEditor.focus(editor);
  Transforms.select(editor, { path: [1, 0], offset: 0 });

  await nextTick();

  scrollSelectionIntoView.mockClear();
  return { editor, scrollSelectionIntoView };
};

test("does not scroll for an edit that did not come from user input", async () => {
  const { editor, scrollSelectionIntoView } = await setup();

  editor.deleteBackward("character");
  await nextTick();

  expect(editor.children).toHaveLength(1);
  expect(scrollSelectionIntoView).not.toHaveBeenCalled();
});

test("does not scroll an already synchronized selection on a render without input", async () => {
  const { editor, scrollSelectionIntoView } = await setup();

  editor.onChange();
  await nextTick();

  expect(scrollSelectionIntoView).not.toHaveBeenCalled();
});

test("does not scroll when an edit elsewhere leaves the selection unchanged", async () => {
  const { editor, scrollSelectionIntoView } = await setup();

  Transforms.insertText(editor, "Elsewhere", {
    at: { path: [0, 0], offset: 0 },
  });
  await nextTick();

  expect(scrollSelectionIntoView).not.toHaveBeenCalled();
});

test("does not scroll an unfocused editor after its selection moves with an edit", async () => {
  const { editor, scrollSelectionIntoView } = await setup();

  DOMEditor.blur(editor);
  await nextTick();
  scrollSelectionIntoView.mockClear();

  editor.deleteBackward("character");
  await nextTick();

  expect(scrollSelectionIntoView).not.toHaveBeenCalled();
});
