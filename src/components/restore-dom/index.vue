<template>
  <slot></slot>
</template>
<script lang="ts" setup>
import {
  createRestoreDomManager,
  type RestoreDOMManager,
} from "./restore-dom-manager";
import {
  inject,
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  ref,
  type Ref,
} from "vue";
import type { Editor } from "slate";

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
};

const props = defineProps<{
  node?: HTMLDivElement | null;
  receivedUserInput: Ref<boolean>;
}>();

const manager = ref<RestoreDOMManager | null>(null);
const mutationObserver = ref<MutationObserver | null>(null);
const editor = inject<Editor>("editorRef");

const observe = () => {
  nextTick(() => {
    if (!props.node) {
      throw new Error("Failed to attach MutationObserver, `node` is undefined");
    }

    mutationObserver.value?.observe(props.node, MUTATION_OBSERVER_CONFIG);
  })
};

onMounted(() => {
  if (editor) {
    manager.value = createRestoreDomManager(editor, props.receivedUserInput.value);
    mutationObserver.value = new MutationObserver(
      manager.value.registerMutations
    );
  }
  observe();
});

onBeforeUpdate(() => {
  const pendingMutations = mutationObserver.value?.takeRecords();
  if (pendingMutations?.length) {
    manager.value?.registerMutations(pendingMutations);
  }

  mutationObserver.value?.disconnect();
  manager.value?.restoreDOM();

  return null;
});

onUpdated(() => {
  manager.value?.clear();
  observe();
});

onBeforeUnmount(() => {
  mutationObserver.value?.disconnect();
});
</script>
