import { CursorState } from "../plugins/withCursors";
import { useRemoteCursorStateStore } from "./useRemoteCursorStateStore";
import { onMounted, onUnmounted, ref, watchEffect } from "vue";

export function useRemoteCursorStates<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>() {
  const [subscribe, getSnapshot] = useRemoteCursorStateStore<TCursorData>();

  const snapshot = ref(getSnapshot());

  const handleStoreChange = () => {
    snapshot.value = getSnapshot();
  };

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

  // 使用 watchEffect 确保在订阅变化时重新订阅
  watchEffect(() => {
    // 如果订阅函数变化，先取消旧的订阅
    const oldUnsubscribe = unsubscribe;
    unsubscribe = subscribe(handleStoreChange);
    return () => {
      oldUnsubscribe?.();
    };
  });

  return snapshot;
}

export function useRemoteCursorStatesSelector<
  TCursorData extends Record<string, unknown> = Record<string, unknown>,
  TSelection = unknown
>(
  selector: (cursors: Record<string, CursorState<TCursorData>>) => TSelection,
  isEqual?: (a: TSelection, b: TSelection) => boolean
): TSelection {
  const [subscribe, getSnapshot] = useRemoteCursorStateStore<TCursorData>();

  const selectedValue = ref<TSelection>(selector(getSnapshot()));
  const lastSnapshot = ref<Record<string, CursorState<TCursorData>>>();
  const lastSelection = ref<TSelection>();

  const getSelection = (snapshot: Record<string, CursorState<TCursorData>>) => {
    if (lastSnapshot.value === snapshot && lastSelection.value !== undefined) {
      return lastSelection.value;
    }
    const nextSelection = selector(snapshot);

    // 使用自定义相等比较或默认严格相等
    if (
      isEqual && lastSelection.value
        ? isEqual(lastSelection.value, nextSelection)
        : lastSelection.value === nextSelection
    ) {
      return lastSelection.value;
    }

    lastSelection.value = nextSelection;
    lastSnapshot.value = snapshot;
    return nextSelection;
  };

  const handleStoreChange = () => {
    const nextSnapshot = getSnapshot();
    const nextSelection = getSelection(nextSnapshot);

    if (!Object.is(selectedValue.value, nextSelection) && nextSelection) {
      selectedValue.value = nextSelection;
    }
  };

  let unsubscribe: () => void;

  onMounted(() => {
    unsubscribe = subscribe(handleStoreChange);
    handleStoreChange();
  });

  onUnmounted(() => {
    unsubscribe?.();
  });

  watchEffect(() => {
    const oldUnsubscribe = unsubscribe;
    unsubscribe = subscribe(handleStoreChange);
    return () => {
      oldUnsubscribe?.();
    };
  });

  return selectedValue.value;
}
