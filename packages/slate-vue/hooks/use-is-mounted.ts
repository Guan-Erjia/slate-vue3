import { onMounted, onUnmounted, ref } from "vue";

export function useIsMounted() {
  const isMountedRef = ref(false);

  onMounted(() => {
    isMountedRef.value = true;
  });
  onUnmounted(() => {
    isMountedRef.value = false;
  });

  return isMountedRef;
}
