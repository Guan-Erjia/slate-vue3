import { isTrackedMutation } from "slate-vue3/dom";
import { ReactiveEditor } from "../../utils/reactive-editor";
import { Ref } from "vue";

export type RestoreDOMManager = {
  registerMutations: (mutations: MutationRecord[]) => void;
  restoreDOM: () => void;
  clear: () => void;
};

export const createRestoreDomManager = (
  editor: ReactiveEditor,
  receivedUserInput: Ref<boolean>,
): RestoreDOMManager => {
  let bufferedMutations: MutationRecord[] = [];

  const clear = () => {
    bufferedMutations = [];
  };

  const registerMutations = (mutations: MutationRecord[]) => {
    if (!receivedUserInput.value) {
      return;
    }

    const trackedMutations = mutations.filter((mutation) =>
      isTrackedMutation(editor, mutation, mutations),
    );

    bufferedMutations.push(...trackedMutations);
  };

  function restoreDOM() {
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
      clear();
    }
  }

  return {
    registerMutations,
    restoreDOM,
    clear,
  };
};
