import { Editor } from "slate";
import { useGenericSelector } from "./use-generic-selector";
import { useEditor } from "./use-editor";
import {
  ComputedRef,
  inject,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
} from "vue";
import { SLATE_USE_SELECTOR } from "../utils/constants";

type Callback = () => void;

export interface SlateSelectorOptions {
  /**
   * If true, defer calling the selector function until after `Editable` has
   * finished rendering. This ensures that `ReactEditor.findPath` won't return
   * an outdated path if called inside the selector.
   */
  deferred?: boolean;
}

const refEquality = (a: any, b: any) => a === b;

/**
 * Use redux style selectors to prevent re-rendering on every keystroke.
 *
 * Bear in mind re-rendering can only prevented if the returned value is a value
 * type or for reference types (e.g. objects and arrays) add a custom equality
 * function.
 *
 * If `selector` is memoized using `useCallback`, then it will only be called
 * when it or the editor state changes. Otherwise, `selector` will be called
 * every time the component renders.
 *
 * @example
 * const isSelectionActive = useSlateSelector(editor => Boolean(editor.selection))
 */

export function useSlateSelector<T>(
  selector: (editor: Editor) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  { deferred }: SlateSelectorOptions = {}
): ComputedRef<T> {
  const SELECTOR_CONTEXT = inject<{
    addEventListener: (
      callback: Callback,
      options?: SlateSelectorOptions
    ) => () => void;
    flushDeferred: () => void;
  }>(SLATE_USE_SELECTOR);

  if (!SELECTOR_CONTEXT) {
    throw new Error(
      `The \`useSlateSelector\` hook must be used inside the <Slate> component's context.`
    );
  }
  const { addEventListener } = SELECTOR_CONTEXT;

  const editor = useEditor();
  const genericSelector = () => selector(editor);

  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn
  );

  const unsubscribe = addEventListener(update, { deferred });
  onMounted(() => {
    update();
  });
  onUnmounted(() => {
    unsubscribe();
  });

  return selectedState;
}

/**
 * Create selector context with editor updating on every editor change
 */
export function useSelectorContext() {
  const eventListeners = ref(new Set<Callback>());
  const deferredEventListeners = ref(new Set<Callback>());

  const onChange = () => {
    eventListeners.value.forEach((listener) => listener());
  };

  const flushDeferred = () => {
    deferredEventListeners.value.forEach((listener) => listener());
    deferredEventListeners.value.clear();
  };

  const addEventListener = (
    callbackProp: Callback,
    { deferred = false }: SlateSelectorOptions = {}
  ) => {
    const callback = deferred
      ? () => deferredEventListeners.value.add(callbackProp)
      : callbackProp;

    eventListeners.value.add(callback);

    return () => {
      eventListeners.value.delete(callback);
    };
  };

  const selectorContext = {
    addEventListener,
    flushDeferred,
  };

  return { selectorContext, onChange };
}

export function useFlushDeferredSelectorsOnRender() {
  const SELECTOR_CONTEXT = inject<{
    addEventListener: (
      callback: Callback,
      options?: SlateSelectorOptions
    ) => () => void;
    flushDeferred: () => void;
  }>(SLATE_USE_SELECTOR);
  if (!SELECTOR_CONTEXT) {
    throw new Error(
      `The \`useFlushDeferredSelectorsOnRender\` hook must be used inside the <Slate> component's context.`
    );
  }
  const { flushDeferred } = SELECTOR_CONTEXT;
  onUpdated(flushDeferred);
}
