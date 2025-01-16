import { Text } from 'slate'
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from 'slate-dom'
import { LeafComp } from './leaf'
import type { TextProps } from './interface'
import { defineComponent, h, onMounted, onUnmounted, ref, toRaw } from 'vue'

/**
 * Text.
 */
export const TextComp = defineComponent({
  name: 'slate-text',
  props: ['editor', 'decorations', 'isLast', 'parent', 'renderPlaceholder', 'renderLeaf', 'text'],
  setup(props: TextProps) {
    const { editor, decorations, isLast, parent, renderPlaceholder, renderLeaf, text } = props
    const rawEditor = toRaw(editor)
    const spanRef = ref<HTMLSpanElement>()
    const leaves = Text.decorations(text, decorations)
    const key = DOMEditor.findKey(editor, toRaw(text))

    onMounted(() => {
      const key = DOMEditor.findKey(editor, toRaw(text))
      if (spanRef.value) {
        const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(rawEditor)
        KEY_TO_ELEMENT?.set(key, spanRef.value)
        ELEMENT_TO_NODE.set(spanRef.value, toRaw(text))
        NODE_TO_ELEMENT.set(toRaw(text), spanRef.value)
      }
    })

    onUnmounted(() => {
      const key = DOMEditor.findKey(editor, toRaw(text))
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(rawEditor)
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(toRaw(text))
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
      editor
    })))
  }
})


