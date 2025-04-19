import { onMounted, onUnmounted, watch } from "vue";
import { useFocused } from "slate-vue";
import { CursorEditor } from "../plugins/withCursors";
import { useRemoteCursorEditor } from "./useRemoteCursorEditor";

export function useUnsetCursorPositionOnBlur() {
  const editor = useRemoteCursorEditor();
  const isFocused = useFocused();

  const sendCursorPosition = (focus?: boolean) => {
    if (focus && editor.selection) {
      CursorEditor.sendCursorPosition(editor, editor.selection);
      return;
    }

    if (!focus) {
      CursorEditor.sendCursorPosition(editor, null);
    }
  };

  const handleWindowBlur = () => {
    if (isFocused.value) {
      sendCursorPosition(false);
    }
  };

  const handleWindowFocus = () => {
    if (isFocused.value) {
      sendCursorPosition(true);
    }
  };
  onMounted(() => {
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
  });

  onUnmounted(() => {
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("focus", handleWindowFocus);
  });

  watch(
    () => isFocused.value,
    () => {
      sendCursorPosition(isFocused.value);
    }
  );
}
