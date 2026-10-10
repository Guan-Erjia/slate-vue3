import {
  defineComponent,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  type Ref,
} from "vue";
import { IS_ANDROID } from "slate-vue3/dom";
import {
  createRestoreDomManager,
  type RestoreDOMManager,
} from "./restore-dom-manager";
import { useEditor } from "../../hooks/use-editor";

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
};

export const RestoreDOM = IS_ANDROID
  ? defineComponent({
      name: "slate-restore-DOM",
      props: ["receivedUserInput", "node"],
      setup(
        props: {
          receivedUserInput: Ref<boolean>;
          node: Ref<HTMLDivElement | null>;
        },
        { slots },
      ) {
        const editor = useEditor();

        let manager: RestoreDOMManager | null = null;
        let mutationObserver: MutationObserver | null = null;

        const observe = () => {
          const node = props.node.value;

          if (!node) {
            throw new Error(
              "Failed to attach MutationObserver, `node` is undefined",
            );
          }

          mutationObserver?.observe(node, MUTATION_OBSERVER_CONFIG);
        };

        onMounted(() => {
          manager = createRestoreDomManager(editor, props.receivedUserInput);
          mutationObserver = new MutationObserver(manager.registerMutations);
          observe();
        });

        onBeforeUpdate(() => {
          const pendingMutations = mutationObserver?.takeRecords();
          if (pendingMutations?.length) {
            manager?.registerMutations(pendingMutations);
          }
          mutationObserver?.disconnect();
          manager?.restoreDOM();
        });

        onUpdated(() => {
          manager?.clear();
          observe();
        });

        onBeforeUnmount(() => {
          mutationObserver?.disconnect();
        });

        return () => slots.default?.();
      },
    })
  : defineComponent({
      name: "slate-restore-DOM",
      setup(_, { slots }) {
        return () => slots.default?.();
      },
    });
