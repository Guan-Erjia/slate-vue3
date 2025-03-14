import { Range, Editor, Element, Point, Transforms } from "slate-vue3/core";
import { DOMEditor } from "slate-vue3/dom";
export const withChecklists = (editor: DOMEditor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          Element.isElement(n) &&
          n.type === "check-list-item",
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);

        if (Point.equals(selection.anchor, start)) {
          const newProperties: Partial<Element> = {
            type: "paragraph",
          };
          Transforms.setNodes(editor, newProperties, {
            match: (n) =>
              !Editor.isEditor(n) &&
              Element.isElement(n) &&
              n.type === "check-list-item",
          });
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
