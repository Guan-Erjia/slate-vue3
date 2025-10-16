import { onMounted, onUnmounted, watch } from "vue";
import { DOMEditor } from "slate-dom";
import { useEditor, useFocused } from "slate-vue";
import { JsonObject } from "@liveblocks/client";
import { CursorEditor } from "../plugins/withCursors";

export function useUnsetCursorPositionOnBlur<TCursor extends JsonObject>() {
  const editor = useEditor() as CursorEditor<TCursor> & DOMEditor;
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
    },
  );
}
