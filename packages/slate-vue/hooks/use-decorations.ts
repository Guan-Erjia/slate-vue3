import { DecoratedRange, Descendant, Node } from "slate";
import {
  isTextDecorationsEqual,
  isElementDecorationsEqual,
  DOMEditor,
} from "slate-vue3/dom";
import { onScopeDispose, shallowRef, watchEffect } from "vue";
import { useEditor } from "./use-editor";
import { injectDecorateFn } from "../render/decorate";

export const useDecorations = (getNode: () => Descendant) => {
  const editor = useEditor();
  const decorate = injectDecorateFn();
  const decorations = shallowRef<DecoratedRange[]>([]);

  const update = () => {
    const node = getNode();
    try {
      const equalityFn = Node.isText(node)
        ? isTextDecorationsEqual
        : isElementDecorationsEqual;
      const path = DOMEditor.findPath(editor, node);
      const newDecorations = decorate([node, path]);

      if (equalityFn(decorations.value, newDecorations)) {
        return;
      }
      decorations.value = newDecorations;
    } catch (err) {
      console.log(err);
      // we ignore all errors here, since when the component
      // is re-rendered, the selectors are called again, and
      // will throw again, if neither props nor store state
      // changed
    }
    // don't rerender on equalityFn change since we want to be able to define it inline
  };

  const stop = watchEffect(update);
  onScopeDispose(stop);

  return {
    decorations,
    update,
  };
};
