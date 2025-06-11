import { Editor, Range } from "slate";
import { DOMEditor } from "slate-dom";
import { computed, type ComputedRef } from "vue";
import { useElementIf } from "./use-element";
import { useEditor } from "./use-editor";

/**
 * Get the current `selected` state of an element.
 */
export const useSelected = (): ComputedRef<boolean> => {
  const element = useElementIf();
  const editor = useEditor();

  return computed(() => {
    if (!editor.selection || !element?.value) return false;
    const path = DOMEditor.findPath(editor, element.value);
    const range = Editor.range(editor, path);
    return !!Range.intersection(range, editor.selection);
  });
};
