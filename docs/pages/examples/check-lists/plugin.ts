import { Range, Editor, Node, Point, Transforms, Path } from "slate";
import { CustomEditor, CustomElement } from "../../../custom-types";
export const withChecklists = (editor: CustomEditor) => {
  const { deleteBackward, insertBreak } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) => Node.isElement(n) && n.type === "check-list-item",
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);

        if (Point.equals(selection.anchor, start)) {
          const newProperties = {
            type: "paragraph",
          };
          Transforms.setNodes(editor, newProperties as any, {
            match: (n) => Node.isElement(n) && n.type === "check-list-item",
          });
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  editor.insertBreak = () => {
    insertBreak();
    const isCheckListItem = (n: Node) =>
      Node.isElement(n) && n.type === "check-list-item";
    const [entry] = Editor.nodes(editor, { match: isCheckListItem });

    if (!entry) {
      return;
    }

    const [item, path] = entry;
    const previousPath = Path.hasPrevious(path) ? Path.previous(path) : null;
    const previous = previousPath && Node.get(editor, previousPath);
    const splitAtStart =
      previous &&
      isCheckListItem(previous) &&
      Editor.isEmpty(editor, previous as CustomElement) &&
      !Editor.isEmpty(editor, item as CustomElement);
    const newProperties: Partial<CustomElement> = { checked: false };
    Transforms.setNodes(editor, newProperties, {
      at: splitAtStart && previousPath ? previousPath : path,
    });
  };

  return editor;
};
