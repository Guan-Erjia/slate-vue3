import { onMounted, onUnmounted, Ref, ref } from "vue";
import { CursorState } from "../plugins/withCursors";
import { useRemoteCursorStateStore } from "./useRemoteCursorStateStore";

export function useRemoteCursorStates<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>(): Ref<Record<string, CursorState<TCursorData>>> {
  const [subscribe, getSnapshot] = useRemoteCursorStateStore<TCursorData>();

  const snapshot = ref(getSnapshot());

  const handleStoreChange = () => (snapshot.value = getSnapshot());
  // 设置订阅
  let unsubscribe: () => void;

  onMounted(() => {
    unsubscribe = subscribe(handleStoreChange);
    // 初始获取快照
    handleStoreChange();
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  return snapshot;
}
