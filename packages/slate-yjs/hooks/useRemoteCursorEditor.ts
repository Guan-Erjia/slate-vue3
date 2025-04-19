import { DOMEditor } from "slate-dom";
import { useEditor } from "slate-vue";
import { CursorEditor } from "../plugins/withCursors";

export function useRemoteCursorEditor<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>(): CursorEditor<TCursorData> & DOMEditor {
  const editor = useEditor();
  if (!CursorEditor.isCursorEditor(editor)) {
    throw new Error(
      "Cannot use useSyncExternalStore outside the context of a RemoteCursorEditor"
    );
  }

  return editor as CursorEditor & DOMEditor;
}
