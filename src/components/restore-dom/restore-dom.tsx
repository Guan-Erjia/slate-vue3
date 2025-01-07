import { DOMEditor, IS_ANDROID, } from '../../slate-dom'
import {
  createRestoreDomManager,
  type RestoreDOMManager,
} from './restore-dom-manager'
import { defineComponent, inject, onBeforeUnmount, onBeforeUpdate, onMounted, onUpdated, ref, renderSlot, type Ref } from 'vue'

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
}

// We have to use a class component here since we rely on `getSnapshotBeforeUpdate` which has no FC equivalent
// to run code synchronously immediately before react commits the component update to the DOM.
export const RestoreDOM = defineComponent({
  name: 'slate-restore-DOM',
  props: ['receivedUserInput', 'node'],
  setup(props: {
    receivedUserInput: Ref<boolean>
    node: Ref<HTMLDivElement>
  }, { slots }) {
    const mutationObserver = ref<MutationObserver | null>(null)
    const manager = ref<RestoreDOMManager | null>(null)
    const observe = () => {
      if (!props.node.value) {
        throw new Error('Failed to attach MutationObserver, `node` is undefined')
      }

      mutationObserver.value?.observe(props.node.value, MUTATION_OBSERVER_CONFIG)
    }

    onMounted(() => {
      if (!IS_ANDROID) {
        return
      }
      const editor = inject("editorRef") as DOMEditor;
      manager.value = createRestoreDomManager(editor, props.receivedUserInput)
      mutationObserver.value = new MutationObserver(manager.value.registerMutations)
      observe()
    })

    onBeforeUpdate(() => {
      if (!IS_ANDROID) {
        return
      }
      const pendingMutations = mutationObserver.value?.takeRecords()
      if (pendingMutations?.length) {
        manager.value?.registerMutations(pendingMutations)
      }

      mutationObserver.value?.disconnect()
      manager.value?.restoreDOM()
      return null
    })

    onUpdated(() => {
      if (!IS_ANDROID) {
        return
      }
      manager.value?.clear()
      observe()
    })

    onBeforeUnmount(() => {
      if (!IS_ANDROID) {
        return
      }
      mutationObserver.value?.disconnect()
    })

    return () => renderSlot(slots, 'default')
  }
})

