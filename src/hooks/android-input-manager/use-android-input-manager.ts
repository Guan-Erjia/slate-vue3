import { DOMEditor, IS_ANDROID } from "../../slate-dom";
import { EDITOR_TO_SCHEDULE_FLUSH } from "../../slate-dom";
import {
  createAndroidInputManager,
  type CreateAndroidInputManagerOptions,
} from "./android-input-manager";
import {
  inject,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  ref,
  toRaw,
  type Ref,
} from "vue";

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
      if (!IS_ANDROID) {
        return null;
      }

      const editor = inject("editorRef") as DOMEditor;
      const rawEditor = toRaw(editor);

      const isMounted = ref(false);
      onMounted(() => (isMounted.value = true));
      onUnmounted(() => (isMounted.value = false));

      const inputManager = createAndroidInputManager({
        editor: rawEditor,
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
      });

      onBeforeUnmount(() => {
        mutationObserver.disconnect();
      });

      EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);
      if (isMounted.value) {
        inputManager.flush();
      }

      return inputManager;
    };
