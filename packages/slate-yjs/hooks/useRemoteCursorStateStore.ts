import { ref } from "vue";
import { BaseEditor } from "slate";
import { useEditor } from "slate-vue";
import { DOMEditor } from "slate-dom";
import { toRawWeakMap as WeakMap } from "share-tools";
import { JsonObject } from "@liveblocks/client";
import { Store } from "./utils";
import {
  CursorEditor,
  CursorState,
  RemoteCursorChangeEventListener,
} from "../plugins/withCursors";

export type CursorStore<TCursorData extends JsonObject = JsonObject> = Store<
  Record<string, CursorState<TCursorData>>
>;

const EDITOR_TO_CURSOR_STORE: WeakMap<BaseEditor, CursorStore> = new WeakMap();

export function useRemoteCursorStateStore<
  TCursorData extends JsonObject = JsonObject
>() {
  const editor = useEditor() as CursorEditor<TCursorData> & DOMEditor;
  const cursors = ref<Record<string, CursorState<TCursorData>>>({});
  const changed = new Set<number>();

  const addChanged = changed.add.bind(changed);

  const changeHandler: RemoteCursorChangeEventListener | null = (event) => {
    event.added.forEach(addChanged);
    event.removed.forEach(addChanged);
    event.updated.forEach(addChanged);
    if (changed.size === 0) {
      return cursors;
    }

    changed.forEach((clientId) => {
      const state = CursorEditor.cursorState(editor, clientId);
      if (state === null) {
        delete cursors.value[clientId.toString()];
        return;
      }

      cursors.value[clientId] = state;
    });

    changed.clear();
  };

  const subscribe = () => {
    CursorEditor.on(editor, "change", changeHandler);

    return () => CursorEditor.off(editor, "change", changeHandler);
  };

  const store: CursorStore<TCursorData> = [subscribe, cursors];
  EDITOR_TO_CURSOR_STORE.set(editor, store);
  return store;
}
