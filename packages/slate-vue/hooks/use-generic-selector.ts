/**
 * Create a selector that updates when an `update` function is called, and
 * which only causes the component to render when the result of `selector`
 * differs from the previous result according to `equalityFn`.
 *
 * If `selector` is memoized using `useCallback`, then it will only be called
 * when it changes or when `update` is called. Otherwise, `selector` will be
 * called every time the component renders.
 *
 * @example
 * const [state, update] = useGenericSelector(selector, equalityFn)
 *
 * useIsomorphicLayoutEffect(() => {
 *   return addEventListener(update)
 * }, [addEventListener, update])
 *
 * return state
 */

import { computed, ComputedRef, getCurrentInstance, ref } from "vue";

export function useGenericSelector<T>(
  selector: () => T,
  equalityFn: (a: T | null, b: T) => boolean
): [state: ComputedRef<T>, update: () => void] {
  const proxy = getCurrentInstance();

  const latestSubscriptionCallbackError = ref<Error | undefined>();
  const latestSelector = ref<() => T>(() => null as any);
  const latestSelectedState = ref<T | null>(null);
  const selectedState = computed<T>(() => {
    let _selectedState: T;
    try {
      if (
        selector !== latestSelector.value ||
        latestSubscriptionCallbackError.value
      ) {
        const selectorResult = selector();

        if (equalityFn(latestSelectedState.value, selectorResult)) {
          _selectedState = latestSelectedState.value;
        } else {
          _selectedState = selectorResult;
        }
      } else {
        _selectedState = latestSelectedState.value;
      }
    } catch (err) {
      if (latestSubscriptionCallbackError.value && isError(err)) {
        err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.value.stack}\n\n`;
      }

      throw err;
    }

    latestSelector.value = selector;
    latestSelectedState.value = _selectedState;
    latestSubscriptionCallbackError.value = undefined;
    return _selectedState;
  });

  const update = () => {
    try {
      const newSelectedState = latestSelector.value();

      if (equalityFn(latestSelectedState.value, newSelectedState)) {
        return;
      }

      latestSelectedState.value = newSelectedState;
    } catch (err) {
      // we ignore all errors here, since when the component
      // is re-rendered, the selectors are called again, and
      // will throw again, if neither props nor store state
      // changed
      if (err instanceof Error) {
        latestSubscriptionCallbackError.value = err;
      } else {
        latestSubscriptionCallbackError.value = new Error(String(err));
      }
    }

    proxy?.update();
    // don't rerender on equalityFn change since we want to be able to define it inline
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return [selectedState, update];
}

function isError(error: any): error is Error {
  return error instanceof Error;
}
