import { onUnmounted, ref } from "vue";
import { useEditor } from "./use-editor";
import { DOMEditor } from "slate-dom";

export function useTrackUserInput() {
  const editor = useEditor();

  const receivedUserInput = ref<boolean>(false);
  const animationFrameIdRef = ref<number>(0);

  const onUserInput = () => {
    if (receivedUserInput.value) {
      return;
    }

    receivedUserInput.value = true;

    const window = DOMEditor.getWindow(editor);
    window.cancelAnimationFrame(animationFrameIdRef.value);

    animationFrameIdRef.value = window.requestAnimationFrame(() => {
      receivedUserInput.value = false;
    });
  };

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameIdRef.value);
  });

  return {
    receivedUserInput,
    onUserInput,
  };
}
