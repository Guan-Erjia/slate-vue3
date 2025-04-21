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

export function createRemoteCursorStateStore<TCursorData extends JsonObject>(
  editor: CursorEditor<TCursorData>
): CursorStore<TCursorData> {
  let cursors: Record<string, CursorState<TCursorData>> = {};

  const changed = new Set<number>();
  const addChanged = changed.add.bind(changed);
  const onStoreChangeListeners: Set<() => void> = new Set();

  let changeHandler: RemoteCursorChangeEventListener | null = null;

  const subscribe = (onStoreChange: () => void) => {
    onStoreChangeListeners.add(onStoreChange);
    if (!changeHandler) {
      changeHandler = (event) => {
        event.added.forEach(addChanged);
        event.removed.forEach(addChanged);
        event.updated.forEach(addChanged);
        onStoreChangeListeners.forEach((listener) => listener());
      };
      CursorEditor.on(editor, "change", changeHandler);
    }

    return () => {
      onStoreChangeListeners.delete(onStoreChange);
      if (changeHandler && onStoreChangeListeners.size === 0) {
        CursorEditor.off(editor, "change", changeHandler);
        changeHandler = null;
      }
    };
  };

  const getSnapshot = () => {
    if (changed.size === 0) {
      return cursors;
    }

    changed.forEach((clientId) => {
      const state = CursorEditor.cursorState(editor, clientId);
      if (state === null) {
        delete cursors[clientId.toString()];
        return;
      }

      cursors[clientId] = state;
    });

    changed.clear();
    cursors = { ...cursors };
    return cursors;
  };

  return [subscribe, getSnapshot];
}

export function useRemoteCursorStateStore<
  TCursorData extends JsonObject = JsonObject
>() {
  const editor = useEditor() as CursorEditor<TCursorData> & DOMEditor;

  const existing = EDITOR_TO_CURSOR_STORE.get(editor);
  if (existing) {
    return existing as CursorStore<TCursorData>;
  }

  const store = createRemoteCursorStateStore(editor);
  EDITOR_TO_CURSOR_STORE.set(editor, store);
  return store;
}
