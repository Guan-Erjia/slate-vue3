/** @jsx jsx */
import { jsx, withTest, withHistory } from "../utils";
import { test, expect } from "vitest";
import { Editor, Transforms } from "slate";

const input = (
  <editor>
    <block>Hello</block>
  </editor>
);

const output = {
  children: [
    {
      children: [
        {
          text: "Hello",
        },
      ],
    },
  ],
  selection: {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 0 },
  },
};

test("keep-after-focus-and-remove-text-undo", () => {
  const editor = withTest(withHistory(input));

  // focus at the end
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
  // select all
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 0 },
  });
  // remove
  Editor.deleteFragment(editor);
  // blur
  Transforms.deselect(editor);
  // focus back
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });

  editor.undo();
  expect(editor.children).toStrictEqual(output.children);
  expect(editor.selection).toStrictEqual(output.selection);
});
