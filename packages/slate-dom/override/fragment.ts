import { Editor, EditorInterface, Node } from "slate";
import { nodeFragment } from "./node-fragment";

export const fragment: EditorInterface["fragment"] = (editor, at) => {
  const range = Editor.range(editor, at);
  return nodeFragment(editor, range);
};
