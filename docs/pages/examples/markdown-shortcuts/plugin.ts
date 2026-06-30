import { nextTick } from "vue";
import {
  BulletedListElement,
  CustomEditor,
  ParagraphElement,
} from "../../../custom-types";
import { Range, Editor, Transforms, Point, Node } from "slate-vue3/core";

export const SHORTCUTS = {
  "*": { type: "list-item" },
  "-": { type: "list-item" },
  "+": { type: "list-item" },
  ">": { type: "blockquote" },
  "#": { type: "heading", depth: 1 },
  "##": { type: "heading", depth: 2 },
  "###": { type: "heading", depth: 3 },
  "####": { type: "heading", depth: 4 },
  "#####": { type: "heading", depth: 5 },
  "######": { type: "heading", depth: 6 },
};

export const withShortcuts = (editor: CustomEditor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = async (text) => {
    const { selection } = editor;

    if (text.endsWith(" ") && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Node.isElement(n) && Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) + text.slice(0, -1);
      const cuts = SHORTCUTS[beforeText as keyof typeof SHORTCUTS] as any;

      if (cuts) {
        Transforms.select(editor, range);

        if (!Range.isCollapsed(range)) {
          Transforms.delete(editor);
        }

        await nextTick();
        const newProperties = {
          ...cuts,
        };
        Transforms.setNodes(editor, newProperties, {
          match: (n) => Node.isElement(n) && Editor.isBlock(editor, n),
        });

        if (cuts.type === "list-item") {
          const list: BulletedListElement = {
            type: "bulleted-list",
            children: [],
          };
          Transforms.wrapNodes(editor, list, {
            match: (n) => Node.isElement(n) && n.type === "list-item",
          });
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Node.isElement(n) && Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          Node.isElement(block) &&
          block.type !== "paragraph" &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties = {
            type: "paragraph",
          };
          Transforms.setNodes(editor, newProperties as ParagraphElement);

          if (block.type === "list-item") {
            Transforms.unwrapNodes(editor, {
              match: (n) => Node.isElement(n) && n.type === "bulleted-list",
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};
