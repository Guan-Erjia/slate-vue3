import { Element, type DecoratedRange, Text } from 'slate'
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from 'slate-dom'
import { LeafComp } from './leaf'
import type { JSX } from 'vue/jsx-runtime'
import type { RenderLeafProps, RenderPlaceholderProps } from './interface'
import { defineComponent, h, onMounted, onUnmounted, ref, toRaw } from 'vue'

/**
 * Text.
 */
export const TextComp = defineComponent({
  name: 'slate-text',
  props: ['editor', 'decorations', 'isLast', 'parent', 'renderPlaceholder', 'renderLeaf', 'text', 'refText'],
  setup(props: {
    decorations: DecoratedRange[]
    isLast: boolean
    parent: Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => JSX.Element
    text: Text
    refText: Text
    editor: DOMEditor
  }) {
    const { editor, decorations, isLast, parent, renderPlaceholder, renderLeaf, } = props
    const rawEditor = toRaw(editor)
    const spanRef = ref<HTMLSpanElement>()
    const leaves = Text.decorations(props.refText, decorations)
    const rawText = toRaw(props.text)
    const key = DOMEditor.findKey(editor, rawText)

    onMounted(() => {
      const key = DOMEditor.findKey(editor, rawText)
      if (spanRef.value) {
        const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(rawEditor)
        KEY_TO_ELEMENT?.set(key, spanRef.value)
        ELEMENT_TO_NODE.set(spanRef.value, rawText)
        NODE_TO_ELEMENT.set(rawText, spanRef.value)
      }
    })

    onUnmounted(() => {
      const key = DOMEditor.findKey(editor, rawText)
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(rawEditor)
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(rawText)
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
      text: props.refText,
      parent,
      editor
    })))
  }
})


