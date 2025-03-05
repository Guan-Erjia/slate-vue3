import { DOMEditor, IS_ANDROID, isTrackedMutation } from 'slate-dom'
import { defineComponent, onBeforeUpdate, onMounted, onUnmounted, onUpdated, Ref, renderSlot } from 'vue'
import { useEditor } from '../hooks/use-editor'


type RestoreDOMManager = {
  registerMutations: (mutations: MutationRecord[]) => void
  restoreDOM: () => void
  clear: () => void
}

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
}

const createRestoreDomManager = (
  editor: DOMEditor,
  receivedUserInput: Ref<boolean>
): RestoreDOMManager => {
  let bufferedMutations: MutationRecord[] = []

  const clear = () => {
    bufferedMutations = []
  }

  const registerMutations = (mutations: MutationRecord[]) => {
    if (!receivedUserInput.value) {
      return
    }

    const trackedMutations = mutations.filter(mutation =>
      isTrackedMutation(editor, mutation, mutations)
    )

    bufferedMutations.push(...trackedMutations)
  }

  function restoreDOM() {
    if (bufferedMutations.length > 0) {
      bufferedMutations.reverse().forEach(mutation => {
        if (mutation.type === 'characterData') {
          // We don't want to restore the DOM for characterData mutations
          // because this interrupts the composition.
          return
        }

        mutation.removedNodes.forEach(node => {
          mutation.target.insertBefore(node, mutation.nextSibling)
        })

        mutation.addedNodes.forEach(node => {
          mutation.target.removeChild(node)
        })
      })

      // Clear buffered mutations to ensure we don't undo them twice
      clear()
    }
  }

  return {
    registerMutations,
    restoreDOM,
    clear,
  }
}

const RestoreDOMComponent = defineComponent({
  name: 'slate-restore',
  props: ['receivedUserInput', 'node'],
  setup(props: {
    receivedUserInput: Ref<boolean>
    node: Ref<HTMLDivElement>
  }, { slots }) {

    const editor = useEditor()
    let mutationObserver: MutationObserver
    let manager: RestoreDOMManager

    const observe = () => {
      if (!props.node.value) {
        throw new Error('Failed to attach MutationObserver, `node` is undefined')
      }

      mutationObserver?.observe(props.node.value, MUTATION_OBSERVER_CONFIG)
    }


    onMounted(() => {
      manager = createRestoreDomManager(editor, props.receivedUserInput)
      mutationObserver = new MutationObserver(manager.registerMutations)
      observe()
    })

    onBeforeUpdate(() => {
      const pendingMutations = mutationObserver?.takeRecords()
      if (pendingMutations?.length) {
        manager?.registerMutations(pendingMutations)
      }
      mutationObserver?.disconnect()
      manager?.restoreDOM()
      return null
    })

    onUpdated(() => {
      manager?.clear()
      observe()
    })

    onUnmounted(() => {
      mutationObserver?.disconnect()
    })

    return () => renderSlot(slots, 'default')
  }
})

export const RestoreDOM = IS_ANDROID
  ? RestoreDOMComponent
  : defineComponent({
    name: 'slate-no-restore',
    setup(_props, { slots }) {
      return () => renderSlot(slots, 'default')
    }
  })
