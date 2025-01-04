import { ReactEditor } from "../plugin/react-editor";
import { useSlateStatic } from "./use-slate-static";
import { onBeforeUnmount, ref } from "vue";

export function useTrackUserInput() {
  const editor = useSlateStatic();

  const receivedUserInput = ref<boolean>(false);
  const animationFrameIdRef = ref<number>(0);

  const onUserInput = () => {
    if (receivedUserInput.value) {
      return;
    }

    receivedUserInput.value = true;

    const window = ReactEditor.getWindow(editor);
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
