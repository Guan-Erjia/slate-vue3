import { Element, type DecoratedRange, Text as SlateText, Editor } from 'slate'
import { ReactEditor, } from '../plugin/react-editor'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from 'slate-dom'
import { Leaf } from './leaf'
import type { JSX } from 'vue/jsx-runtime'
import type { RenderLeafProps, RenderPlaceholderProps } from './interface'
import { defineComponent, h, inject, onMounted, ref, toRaw, type VNodeArrayChildren } from 'vue'

/**
 * Text.
 */
export const TextComp = defineComponent({
  name: 'Text',
  props: {
    decorations: {},
    isLast: {},
    parent: {},
    renderPlaceholder: {},
    renderLeaf: {},
    text: {},
  },
  setup(props: {
    decorations: DecoratedRange[]
    isLast: boolean
    parent: Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf?: (props: RenderLeafProps) => JSX.Element
    text: SlateText
  }) {
    const { decorations, isLast, parent, renderPlaceholder, renderLeaf, text } =
      props
    const editor = inject("editorRef") as Editor;
    const rawEditor = toRaw(editor)
    const spanRef = ref<HTMLSpanElement | null>(null)
    const leaves = SlateText.decorations(text, decorations)
    const key = ReactEditor.findKey(editor, text)
    const children: VNodeArrayChildren = []

    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i]

      children.push(
        <Leaf
          isLast={isLast && i === leaves.length - 1}
          key={`${key.id}-${i}`}
          renderPlaceholder={renderPlaceholder}
          leaf={leaf}
          text={text}
          parent={parent}
          renderLeaf={renderLeaf}
        />
      )
    }

    // Update element-related weak maps with the DOM element ref.

    onMounted(() => {
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(rawEditor)
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

    return () => h('span', {
      'data-slate-node': 'text',
      ref: spanRef
    }, children)
  }
})


