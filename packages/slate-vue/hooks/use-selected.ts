import { Editor, Range } from "slate-vue3/core";
import { DOMEditor } from "slate-vue3/dom";
import { computed, type ComputedRef } from "vue";
import { useElementIf } from "./use-element";
import { useEditor } from "./use-editor";

/**
 * Get the current `selected` state of an element.
 */
export const useSelected = ({
  suppressThrow = false,
}: { suppressThrow?: boolean } = {}): ComputedRef<boolean> => {
  const element = useElementIf();
  const editor = useEditor();

  return computed(() => {
    if (!editor.selection || !element) return false;
    try {
      const path = DOMEditor.findPath(editor, element);
      const range = Editor.range(editor, path);
      return !!Range.intersection(range, editor.selection);
    } catch (e) {
      if (suppressThrow) {
        return false;
      }
      throw e;
    }
  });
};
