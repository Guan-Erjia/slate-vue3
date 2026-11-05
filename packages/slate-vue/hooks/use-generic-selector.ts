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

import { ShallowRef, shallowRef } from "vue";

export function useGenericSelector<T>(
  selector: () => T,
  equalityFn: (a: T | null, b: T) => boolean,
): [state: ShallowRef<T>, update: () => void] {
  const selectedState = shallowRef<T>(selector());

  let latestSelectedState: T = selectedState.value;
  let latestSubscriptionCallbackError: Error | undefined;

  const update = () => {
    try {
      const newSelectedState = selector();

      if (equalityFn(latestSelectedState, newSelectedState)) {
        return;
      }

      latestSelectedState = newSelectedState;
      selectedState.value = newSelectedState;
      latestSubscriptionCallbackError = undefined;
    } catch (err) {
      if (latestSubscriptionCallbackError && isError(err)) {
        err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.stack}\n\n`;
      }

      throw err;
    }
  };

  return [selectedState, update];
}
function isError(error: any): error is Error {
  return error instanceof Error;
}
