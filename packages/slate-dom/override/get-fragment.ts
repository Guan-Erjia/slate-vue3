import { Editor } from "slate";
import { WithEditorFirstArg } from "slate/dist/utils";
import { nodeFragment } from "./node-fragment";
export const getFragment: WithEditorFirstArg<Editor["getFragment"]> = (
  editor,
) => {
  const { selection } = editor;

  if (selection) {
    return nodeFragment(editor, selection);
  }
  return [];
};
