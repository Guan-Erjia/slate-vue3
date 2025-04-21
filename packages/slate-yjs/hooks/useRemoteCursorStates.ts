import { onMounted, onUnmounted, Ref, ref } from "vue";
import { JsonObject } from "@liveblocks/client";
import { CursorState } from "../plugins/withCursors";
import { useRemoteCursorStateStore } from "./useRemoteCursorStateStore";

export function useRemoteCursorStates<
  TCursorData extends JsonObject = JsonObject
>(): Ref<Record<string, CursorState<TCursorData>>> {
  const [subscribe, cursors] = useRemoteCursorStateStore<TCursorData>();

  // 设置订阅
  let unsubscribe: () => void;

  onMounted(() => {
    unsubscribe = subscribe();
    // 初始获取快照
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  return cursors;
}
