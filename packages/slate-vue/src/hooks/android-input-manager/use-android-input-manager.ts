import { DOMEditor, IS_ANDROID, EDITOR_TO_SCHEDULE_FLUSH } from "slate-dom";
import {
  createAndroidInputManager,
  type CreateAndroidInputManagerOptions,
} from "./android-input-manager";
import {
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  ref,
  type Ref,
} from "vue";
import { useEditor } from "../use-editor";

type UseAndroidInputManagerOptions = {
  node: Ref<HTMLElement | undefined>;
} & Omit<
  CreateAndroidInputManagerOptions,
  "editor" | "onUserInput" | "receivedUserInput"
>;

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
};

export const useAndroidInputManager = !IS_ANDROID
  ? () => null
  : ({ node, ...options }: UseAndroidInputManagerOptions) => {
      const editor = useEditor();

      const inputManager = createAndroidInputManager({
        editor,
        ...options,
      });

      const mutationObserver = new MutationObserver(
        inputManager.handleDomMutations
      );

      onBeforeUpdate(() => {
        // Discard mutations caused during render phase. This works due to react calling
        // useLayoutEffect synchronously after the render phase before the next tick.
        mutationObserver.takeRecords();
      });

      onMounted(() => {
        if (!node.value) {
          throw new Error(
            "Failed to attach MutationObserver, `node` is undefined"
          );
        }
        mutationObserver.observe(node.value, MUTATION_OBSERVER_CONFIG);
        inputManager.flush();
      });

      onUnmounted(() => {
        mutationObserver.disconnect();
      });

      EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);

      return inputManager;
    };
