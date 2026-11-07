import { IS_ANDROID, EDITOR_TO_SCHEDULE_FLUSH } from "slate-vue3/dom";
import {
  createAndroidInputManager,
  CreateAndroidInputManagerOptions,
  EDITOR_TO_FLUSH_DEFERRED_DIFFS,
} from "./android-input-manager";
import { useIsMounted } from "../use-is-mounted";
import { useMutationObserver } from "../use-mutation-observer";
import { useEditor } from "../use-editor";
import { Ref } from "vue";

type UseAndroidInputManagerOptions = {
  node: Ref<HTMLElement | null>;
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

      const editor = useEditor();
      const isMounted = useIsMounted();

      const inputManager = createAndroidInputManager({
        editor,
        ...options,
      });

      useMutationObserver(
        node,
        inputManager.handleDomMutations,
        MUTATION_OBSERVER_CONFIG,
      );

      EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);
      EDITOR_TO_FLUSH_DEFERRED_DIFFS.set(
        editor,
        inputManager.flushDeferredDiffs,
      );
      if (isMounted.value) {
        inputManager.flush();
      }

      return inputManager;
    };
