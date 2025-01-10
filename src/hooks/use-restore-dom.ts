import { DOMEditor, IS_ANDROID, isTrackedMutation } from "slate-dom";
import {
  inject,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  reactive,
  ref,
  type Ref,
} from "vue";

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
};

// We have to use a class component here since we rely on `getSnapshotBeforeUpdate` which has no FC equivalent
// to run code synchronously immediately before react commits the component update to the DOM.
export const useRestoreDOM = (node: Ref<HTMLElement | undefined>) => {
  const mutationObserver = ref<MutationObserver>();
  const manager = reactive<{
    registerMutations: (mutations: MutationRecord[]) => void;
    restoreDOM: () => void;
    clear: () => void;
  }>({
    registerMutations: () => {},
    restoreDOM: () => {},
    clear: () => {},
  });
  const editor = inject("editorRef") as DOMEditor;
  let bufferedMutations: MutationRecord[] = [];
  const observe = () => {
    if (!node.value) {
      throw new Error("Failed to attach MutationObserver, `node` is undefined");
    }
    mutationObserver.value?.observe(node.value, MUTATION_OBSERVER_CONFIG);
  };
  const receivedUserInput = ref<boolean>(false);
  const animationFrameIdRef = ref<number>(0);

  const onUserInput = () => {
    if (receivedUserInput.value) {
      return;
    }

    receivedUserInput.value = true;

    const window = DOMEditor.getWindow(editor);
    window.cancelAnimationFrame(animationFrameIdRef.value);

    animationFrameIdRef.value = window.requestAnimationFrame(() => {
      receivedUserInput.value = false;
    });
  };
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationFrameIdRef.value);
  });

  onMounted(() => {
    if (!IS_ANDROID) return;

    manager.clear = () => (bufferedMutations = []);
    manager.registerMutations = (mutations: MutationRecord[]) => {
      if (!receivedUserInput.value) {
        return;
      }
      bufferedMutations.push(
        ...mutations.filter((mutation) =>
          isTrackedMutation(editor, mutation, mutations)
        )
      );
    };
    manager.restoreDOM = () => {
      if (bufferedMutations.length > 0) {
        bufferedMutations.reverse().forEach((mutation) => {
          if (mutation.type === "characterData") {
            // We don't want to restore the DOM for characterData mutations
            // because this interrupts the composition.
            return;
          }

          mutation.removedNodes.forEach((node) => {
            mutation.target.insertBefore(node, mutation.nextSibling);
          });

          mutation.addedNodes.forEach((node) => {
            mutation.target.removeChild(node);
          });
        });

        // Clear buffered mutations to ensure we don't undo them twice
        manager.clear();
      }
    };

    mutationObserver.value = new MutationObserver(manager.registerMutations);
    observe();
  });

  onBeforeUpdate(() => {
    if (!IS_ANDROID) return;
    const pendingMutations = mutationObserver.value?.takeRecords();
    if (pendingMutations?.length) {
      manager?.registerMutations(pendingMutations);
    }

    mutationObserver.value?.disconnect();
    manager?.restoreDOM();
  });

  onUpdated(() => {
    if (!IS_ANDROID) return;
    manager?.clear();
    observe();
  });

  onBeforeUnmount(() => {
    if (!IS_ANDROID) return;
    mutationObserver.value?.disconnect();
  });

  return {
    onUserInput,
  };
};
