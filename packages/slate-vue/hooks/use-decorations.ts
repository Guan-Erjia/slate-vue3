import { DecoratedRange, Descendant, Editor, Node, Path, Range } from "slate";
import {
  isTextDecorationsEqual,
  isElementDecorationsEqual,
  DOMEditor,
} from "slate-vue3/dom";
import { onScopeDispose, shallowRef, watchEffect } from "vue";
import { useEditor } from "./use-editor";
import { useRenderProps } from "../render/fn";

export const useDecorations = (getNode: () => Descendant) => {
  const editor = useEditor();
  const renderProps = useRenderProps();
  const decorations = shallowRef<DecoratedRange[]>([]);
  const nodePath = shallowRef<Path>(DOMEditor.findPath(editor, getNode()));
  let currentDecorations: DecoratedRange[] = [];

  const update = () => {
    nodePath.value = DOMEditor.findPath(editor, getNode());
  };

  const stop = watchEffect(() => {
    const node = getNode();
    const path = nodePath.value;
    const ranges = renderProps.decorate?.([node, path]) ?? [];
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

    if (!equalityFn(currentDecorations, newDecorations)) {
      currentDecorations = newDecorations;
      decorations.value = newDecorations;
    }
  });
  onScopeDispose(stop);

  return {
    decorations,
    update,
  };
};
