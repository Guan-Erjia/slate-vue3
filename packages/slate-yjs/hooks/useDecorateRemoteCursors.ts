import { onMounted, onUnmounted, ref } from "vue";
import { BaseRange, BaseText, NodeEntry, Range } from "slate";
import { DOMEditor } from "slate-dom";
import { JsonObject } from "@liveblocks/client";
import {
  CursorEditor,
  CursorState,
  RemoteCursorChangeEventListener,
} from "../plugins/withCursors";
import { getCursorRange } from "../hooks/utils";

export const REMOTE_CURSOR_DECORATION_PREFIX = "remote-cursor-";
export const REMOTE_CURSOR_CARET_DECORATION_PREFIX = "remote-caret-";

export type RemoteCaretDecoration<TCursorData extends JsonObject = JsonObject> =
  {
    [
      key: `${typeof REMOTE_CURSOR_CARET_DECORATION_PREFIX}${string}`
    ]: CursorState<TCursorData> & { isBackward: boolean };
  };

export type RemoteCursorDecoration<
  TCursorData extends JsonObject = JsonObject
> = {
  [
    key: `${typeof REMOTE_CURSOR_DECORATION_PREFIX}${string}`
  ]: CursorState<TCursorData>;
};

export type RemoteCursorDecoratedRange<
  TCursorData extends JsonObject = JsonObject
> = BaseRange & RemoteCursorDecoration<TCursorData>;

export type RemoteCaretDecoratedRange<
  TCursorData extends JsonObject = JsonObject
> = BaseRange & RemoteCaretDecoration<TCursorData>;

export type TextWithRemoteCursors<TCursorData extends JsonObject = JsonObject> =
  BaseText &
    RemoteCursorDecoration<TCursorData> &
    RemoteCaretDecoration<TCursorData>;

export function getRemoteCursorsOnLeaf<
  TCursorData extends JsonObject,
  TLeaf extends TextWithRemoteCursors<TCursorData>
>(leaf: TLeaf): CursorState<TCursorData>[] {
  return Object.entries(leaf)
    .filter(([key]) => key.startsWith(REMOTE_CURSOR_DECORATION_PREFIX))
    .map(([, data]) => data);
}

export function getRemoteCaretsOnLeaf<
  TCursorData extends JsonObject,
  TLeaf extends TextWithRemoteCursors<TCursorData>
>(leaf: TLeaf): (CursorState<TCursorData> & { isBackward: boolean })[] {
  return Object.entries(leaf)
    .filter(([key]) => key.startsWith(REMOTE_CURSOR_CARET_DECORATION_PREFIX))
    .map(([, data]) => data);
}

export type UseDecorateRemoteCursorsOptions = {
  carets?: boolean;
};

function getDecoration<TCursorData extends JsonObject, TCaret extends boolean>(
  clientId: string,
  state: CursorState<TCursorData>,
  range: BaseRange,
  caret: TCaret
): TCaret extends true
  ? RemoteCursorDecoratedRange<TCursorData>
  : RemoteCaretDecoratedRange<TCursorData> {
  if (!caret) {
    const key = `${REMOTE_CURSOR_DECORATION_PREFIX}${clientId}`;
    return { ...range, [key]: state };
  }

  const key = `${REMOTE_CURSOR_CARET_DECORATION_PREFIX}${clientId}`;
  return {
    ...range,
    anchor: range.focus,
    [key]: state,
  };
}

export function useDecorateRemoteCursors<
  TCursorData extends JsonObject = JsonObject
>(editor: CursorEditor<TCursorData> & DOMEditor, carets: boolean) {
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

  // 设置订阅
  let unsubscribe: () => void;

  onMounted(() => {
    unsubscribe = subscribe();
    // 初始获取快照
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  return (entry: NodeEntry) => {
    const [, path] = entry;
    if (path.length !== 1) {
      return [];
    }
    return Object.entries(cursors.value).flatMap(([clientId, state]) => {
      const range = getCursorRange(editor, state);
      if (!range) {
        return [];
      }

      if (carets && Range.isCollapsed(range)) {
        return getDecoration(clientId, state, range, true);
      }

      if (!carets) {
        return getDecoration(clientId, state, range, false);
      }

      return [
        getDecoration(clientId, state, range, false),
        getDecoration(clientId, state, range, true),
      ];
    });
  };
}
