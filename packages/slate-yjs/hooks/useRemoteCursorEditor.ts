import { JsonObject } from "@liveblocks/client";
import { CursorEditor } from "../plugins";
import { ReactiveEditor, useEditor } from "slate-vue3";

export function useRemoteCursorEditor<
  TCursorData extends JsonObject = JsonObject,
>(): CursorEditor<TCursorData> & ReactiveEditor {
  const editor = useEditor();
  if (!CursorEditor.isCursorEditor(editor)) {
    throw new Error(
      "Cannot use useSyncExternalStore outside the context of a RemoteCursorEditor",
    );
  }

  return editor as CursorEditor & ReactiveEditor;
}
