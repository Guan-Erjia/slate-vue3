import { DecoratedRange, Descendant, NodeEntry, Text } from "slate";
import {
  isTextDecorationsEqual,
  isElementDecorationsEqual,
  DOMEditor,
} from "slate-dom";
import { useGenericSelector } from "./use-generic-selector";
import { useEditor } from "./use-editor";
import { computed, ComputedRef, onMounted, onUnmounted, ref, watch } from "vue";
import { useDecorate } from "./use-decorate";

/**
 * A React context for sharing the `decorate` prop of the editable and
 * subscribing to changes on this prop.
 */

export const useDecorations = (
  node: Descendant,
  parentDecorations: DecoratedRange[]
): ComputedRef<DecoratedRange[]> => {
  const editor = useEditor();
  const { decorate, addEventListener } = useDecorate();

  // Not memoized since we want nodes to be decorated on each render
  const selector = () => {
    const path = DOMEditor.findPath(editor, node);
    return decorate([node, path]);
  };

  const equalityFn = Text.isText(node)
    ? isTextDecorationsEqual
    : isElementDecorationsEqual;

  const [decorations, update] = useGenericSelector(selector, equalityFn);

  const unsubscribe = addEventListener(update);
  onMounted(() => {
    update();
  });
  onUnmounted(() => {
    unsubscribe();
  });

  return computed(() => [...decorations, ...parentDecorations]);
};

export const useDecorateContext = (
  decorateProp: (entry: NodeEntry) => DecoratedRange[]
) => {
  const eventListeners = ref(new Set<() => void>());

  const latestDecorate = ref(decorateProp);

  watch(
    () => decorateProp,
    () => {
      latestDecorate.value = decorateProp;
      eventListeners.value.forEach((listener) => listener());
    }
  );

  const decorate = (entry: NodeEntry) => latestDecorate.value(entry);

  const addEventListener = (callback: () => void) => {
    eventListeners.value.add(callback);

    return () => {
      eventListeners.value.delete(callback);
    };
  };

  return computed(() => ({ decorate, addEventListener }));
};
