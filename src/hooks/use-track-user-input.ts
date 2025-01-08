import { DOMEditor } from "../slate-dom";
import { inject, onBeforeUnmount, ref } from "vue";

export function useTrackUserInput() {
  const editor = inject("editorRef") as DOMEditor;

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
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameIdRef.value);
  });

  return {
    receivedUserInput,
    onUserInput,
  };
}
