import { onBeforeUpdate, onMounted, onUnmounted, onUpdated, Ref } from "vue";

export function useMutationObserver(
  node: Ref<HTMLElement | undefined>,
  callback: MutationCallback,
  options: MutationObserverInit,
) {
  const mutationObserver = new MutationObserver(callback);

  onBeforeUpdate(() => {
    // Discard mutations caused during render phase. This works due to react calling
    // useLayoutEffect synchronously after the render phase before the next tick.
    mutationObserver.takeRecords();
  });

  onMounted(() => {
    if (!node.value) {
      throw new Error("Failed to attach MutationObserver, `node` is undefined");
    }
    mutationObserver.observe(node.value, options);
  });

  onUnmounted(() => {
    mutationObserver.disconnect();
  });
}
