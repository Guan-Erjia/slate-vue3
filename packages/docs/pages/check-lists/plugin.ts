import {
  Range,
  Editor,
  Element,
  Point,
  Transforms,
  BaseElement,
} from "slate-vue3/core";
import { CustomEditor, CustomElement } from "../../custom-types";
export const withChecklists = (editor: CustomEditor) => {
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
          const newProperties: Partial<CustomElement> = {
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
