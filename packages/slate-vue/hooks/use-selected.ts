import { Editor, Range } from "slate";
import { useElementPropsIf } from "./use-element";
import { useSlateSelector } from "./use-slate-selector";
import { DOMEditor } from "slate-vue3/dom";
import { ShallowRef } from "vue";

/**
 * Get the current `selected` state of an element.
 *
 * Set `suppressThrow` to return `false` instead of throwing when the element
 * can no longer be found in the editor.
 */

export const useSelected = ({
  suppressThrow = false,
}: { suppressThrow?: boolean } = {}): ShallowRef<boolean> => {
  const props = useElementPropsIf();

  // Breaking the rules of hooks is fine here since `!element` will remain true
  // or false for the entire lifetime of the component this hook is called from.
  // TODO: Decide if we want to throw an error instead when calling
  // `useSelected` outside of an element (potentially a breaking change).

  const selector = (editor: Editor) => {
    if (!props?.element) return false;
    if (!editor.selection) return false;
    try {
      const path = DOMEditor.findPath(editor, props.element);
      const range = Editor.range(editor, path);
      return !!Range.intersection(range, editor.selection);
    } catch (e) {
      if (suppressThrow) {
        return false;
      }
      throw e;
    }
  };
  return useSlateSelector(selector, undefined, {
    // Defer the selector until after `Editable` has rendered so that the path
    // will be accurate.
    deferred: true,
  });
};
