import { onMounted, onUnmounted, Ref } from "vue";
import { JsonObject } from "@liveblocks/client";
import { ref } from "vue";
import { BaseEditor } from "slate";
import { useEditor } from "slate-vue";
import { DOMEditor } from "slate-dom";
import { Store } from "./utils";
import {
  CursorEditor,
  CursorState,
  RemoteCursorChangeEventListener,
} from "../plugins/withCursors";

const EDITOR_TO_CURSOR_STORE = new WeakMap<
  BaseEditor,
  Ref<Record<string, CursorState<JsonObject>>>
>();

export function useRemoteCursorStates<
  TCursorData extends JsonObject = JsonObject
>(): Ref<Record<string, CursorState<TCursorData>>> {
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

  const subscribe = () => CursorEditor.on(editor, "change", changeHandler);

  const unSubscribe = () => CursorEditor.off(editor, "change", changeHandler);

  const cacheCursor = EDITOR_TO_CURSOR_STORE.get(editor);
  if (cacheCursor) {
    return cacheCursor as Ref<Record<string, CursorState<TCursorData>>>;
  }

  onMounted(() => {
    subscribe();
  });

  onUnmounted(() => {
    unSubscribe();
  });

  EDITOR_TO_CURSOR_STORE.set(editor, cursors);

  return cursors;
}
