import { Editor } from "slate";
import { useEditor } from "./use-editor";
import { useGenericSelector } from "./use-generic-selector";
import { inject, onUnmounted, onUpdated, ShallowRef } from "vue";

type Callback = () => void;

export const SLATE_INNER_SELECTOR_CONTEXT = "SLATE_INNER_SELECTOR_CONTEXT";
export interface SlateSelectorOptions {
  /**
   * If true, defer calling the selector function until after `Editable` has
   * finished rendering. This ensures that `ReactEditor.findPath` won't return
   * an outdated path if called inside the selector.
   */
  deferred?: boolean;
}

interface SlateSelectorContext {
  addEventListener: (
    callback: Callback,
    options?: SlateSelectorOptions,
  ) => () => void;
  flushDeferred: () => void;
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
  { deferred }: SlateSelectorOptions = {},
): ShallowRef<T> {
  const context = inject<SlateSelectorContext>(SLATE_INNER_SELECTOR_CONTEXT);
  if (!context) {
    throw new Error(
      `The \`useSlateSelector\` hook must be used inside the <Slate> component's context.`,
    );
  }
  const { addEventListener } = context;

  const editor = useEditor();
  const genericSelector = () => selector(editor);
  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn,
  );

  const unsubscribe = addEventListener(update, { deferred });
  onUpdated(() => {
    update();
  });
  onUnmounted(() => {
    // Cleanup the event listener when the component is unmounted
    unsubscribe();
  });

  return selectedState;
}

/**
 * Create selector context with editor updating on every editor change
 */
export function useSelectorContext() {
  const eventListeners = new Set<Callback>();
  const deferredEventListeners = new Set<Callback>();

  const onChange = () => {
    eventListeners.forEach((listener) => listener());
  };

  const flushDeferred = () => {
    deferredEventListeners.forEach((listener) => listener());
    deferredEventListeners.clear();
  };

  const addEventListener = (
    callbackProp: Callback,
    { deferred = false }: SlateSelectorOptions = {},
  ) => {
    const callback = deferred
      ? () => deferredEventListeners.add(callbackProp)
      : callbackProp;

    eventListeners.add(callback);

    return () => {
      eventListeners.delete(callback);
    };
  };

  const selectorContext = {
    addEventListener,
    flushDeferred,
  };

  return { selectorContext, onChange };
}

export function useFlushDeferredSelectorsOnRender() {
  const context = inject<SlateSelectorContext>(SLATE_INNER_SELECTOR_CONTEXT);
  if (!context) {
    throw new Error(
      `The deferred selector hook must be used inside the <Slate> component's context.`,
    );
  }
  return context.flushDeferred;
}
