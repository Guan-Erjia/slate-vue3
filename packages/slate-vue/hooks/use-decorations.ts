import { DecoratedRange, Descendant, Editor, Node, Range } from "slate";
import {
  isTextDecorationsEqual,
  isElementDecorationsEqual,
  DOMEditor,
} from "slate-vue3/dom";
import { onScopeDispose, shallowRef, watch } from "vue";
import { useEditor } from "./use-editor";
import { injectDecorateFn } from "../render/decorate";

export const useDecorations = (getNode: () => Descendant) => {
  const editor = useEditor();
  const decorate = injectDecorateFn();
  const decorations = shallowRef<DecoratedRange[]>([]);

  const update = () => {
    const node = getNode();
    const path = DOMEditor.findPath(editor, node);
    const ranges = decorate([node, path]);
    const equalityFn = Node.isText(node)
      ? isTextDecorationsEqual
      : isElementDecorationsEqual;
    const newDecorations = Node.isText(node)
      ? ranges.flatMap((decoration) => {
          const intersection = Range.intersection(
            decoration,
            Editor.range(editor, path),
          );
          return intersection ? [intersection] : [];
        })
      : ranges;

    if (equalityFn(decorations.value, newDecorations)) {
      return;
    }
    decorations.value = newDecorations;
  };

  const stop = watch([getNode, () => decorate], update, { immediate: true });
  onScopeDispose(stop);

  return {
    decorations,
    update,
  };
};
