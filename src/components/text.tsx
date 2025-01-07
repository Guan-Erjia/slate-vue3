import { Element, type DecoratedRange, Text } from 'slate'
import { DOMEditor } from '../plugin/react-editor'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '../slate-dom'
import { LeafComp } from './leaf'
import type { JSX } from 'vue/jsx-runtime'
import type { RenderLeafProps, RenderPlaceholderProps } from './interface'
import { defineComponent, h, inject, onBeforeUnmount, onMounted, ref, toRaw } from 'vue'

/**
 * Text.
 */
export const TextComp = defineComponent({
  name: 'slate-text',
  props: ['decorations', 'isLast', 'parent', 'renderPlaceholder', 'renderLeaf', 'text'],
  setup(props: {
    decorations: DecoratedRange[]
    isLast: boolean
    parent: Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => JSX.Element
    text: Text
  }) {
    const { decorations, isLast, parent, renderPlaceholder, renderLeaf, text } =
      props
    const editor = inject("editorRef") as DOMEditor;
    const rawEditor = toRaw(editor)
    const spanRef = ref<HTMLSpanElement>()
    const leaves = Text.decorations(props.text, decorations)
    const key = DOMEditor.findKey(editor, toRaw(text))

    // Update element-related weak maps with the DOM element ref.
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(rawEditor)

    onMounted(() => {
      if (spanRef.value) {
        KEY_TO_ELEMENT?.set(key, spanRef.value)
        NODE_TO_ELEMENT.set(text, spanRef.value)
        ELEMENT_TO_NODE.set(spanRef.value, text)
      } else {
        KEY_TO_ELEMENT?.delete(key)
        NODE_TO_ELEMENT.delete(text)
        if (spanRef.value) {
          ELEMENT_TO_NODE.delete(spanRef.value)
        }
      }
    })

    onBeforeUnmount(() => {
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(text)
      if (spanRef.value) {
        ELEMENT_TO_NODE.delete(spanRef.value)
      }
    })

    return () => h('span', {
      'data-slate-node': 'text',
      ref: spanRef
    }, leaves.map((leaf, i) => h(LeafComp, {
      isLast: isLast && i === leaves.length - 1,
      key: `${key.id}-${i}`,
      renderPlaceholder,
      renderLeaf,
      leaf,
      text,
      parent,
    })))
  }
})


