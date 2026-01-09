import { Node } from "../interfaces/node";
import { Editor, EditorInterface } from "../interfaces/editor";

export const elementReadOnly: EditorInterface["elementReadOnly"] = (
  editor,
  options = {},
) => {
  return Editor.above(editor, {
    ...options,
    match: (n) => Node.isElement(n) && Editor.isElementReadOnly(editor, n),
  });
};
