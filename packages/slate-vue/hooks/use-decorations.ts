import { DecoratedRange, Editor, Node, Path, Range } from "slate";
import {
  isTextDecorationsEqual,
  isElementDecorationsEqual,
  DOMEditor,
} from "slate-vue3/dom";
import { computed, onScopeDispose, shallowRef, watchEffect } from "vue";
import { useEditor } from "./use-editor";
import { useRenderProps } from "../render/fn";
import { ElementProps, TextProps } from "../utils/interface";

export const useDecorations = (props: ElementProps | TextProps) => {
  const editor = useEditor();
  const renderProps = useRenderProps();
  const decorations = shallowRef<DecoratedRange[]>([]);
  const node = computed(() =>
    "element" in props ? props.element : props.text,
  );
  let currentDecorations: DecoratedRange[] = [];

  const nodePath = shallowRef<Path>(DOMEditor.findPath(editor, node.value));

  const update = () => {
    nodePath.value = DOMEditor.findPath(editor, node.value);
  };

  const stop = watchEffect(() => {
    const current = node.value;
    const path = nodePath.value;
    const ranges = renderProps.decorate?.([current, path]) ?? [];
    const equalityFn = Node.isText(current)
      ? isTextDecorationsEqual
      : isElementDecorationsEqual;
    const newDecorations = Node.isText(current)
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
