import { IS_ANDROID } from "../../slate-dom";
import { EDITOR_TO_SCHEDULE_FLUSH } from "../../slate-dom";
import {
  createAndroidInputManager,
  type CreateAndroidInputManagerOptions,
} from "./android-input-manager";
import { useIsMounted } from "../use-is-mounted";
import { useMutationObserver } from "../use-mutation-observer";
import { inject, toRaw, type Ref } from "vue";
import type { Editor } from "slate";

type UseAndroidInputManagerOptions = {
  node: Ref<HTMLElement>;
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

      const editor = inject("editorRef") as Editor;
      const rawEditor = toRaw(editor);
      const isMounted = useIsMounted();

      const inputManager = createAndroidInputManager({
        editor: rawEditor,
        ...options,
      });

      useMutationObserver(
        node,
        inputManager.handleDomMutations,
        MUTATION_OBSERVER_CONFIG
      );

      EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);
      if (isMounted) {
        inputManager.flush();
      }

      return inputManager;
    };
