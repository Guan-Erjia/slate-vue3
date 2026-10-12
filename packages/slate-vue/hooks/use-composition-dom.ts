import { onUnmounted, ref } from "vue";
import { createRestoreDomManager } from "../components/restore-dom/restore-dom-manager";
import { DOMEditor } from "slate-vue3/dom";
import { Editor } from "slate";

export const useCompositionDOM = (editor: Editor) => {
  const manager = createRestoreDomManager(editor, ref(true));
  let observer: MutationObserver | null = null;

  const clear = () => {
    observer?.disconnect();
    observer = null;
    manager.clear();
  };

  const track = (text: string | null) => {
    if (!observer) {
      if (!text?.includes("\n")) return;
      observer = new MutationObserver(manager.registerMutations);
    }
    observer.observe(DOMEditor.toDOMNode(editor, editor), {
      childList: true,
      subtree: true,
    });
  };

  const pause = () => {
    if (!observer) return;
    manager.registerMutations(observer.takeRecords());
    observer.disconnect();
  };

  const restore = () => {
    pause();
    manager.restoreDOM();
  };

  onUnmounted(() => clear());

  return {
    track,
    pause,
    restore,
    clear,
  };
};
