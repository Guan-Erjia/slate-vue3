import { Element, type DecoratedRange, Text as SlateText } from 'slate'
import { ReactEditor, useSlateStatic } from '..'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from 'slate-dom'
import Leaf from './leaf'
import type { JSX } from 'vue/jsx-runtime'
import type { RenderLeafProps, RenderPlaceholderProps } from './interface'
import { h, ref } from 'vue'

/**
 * Text.
 */

const Text = (props: {
  decorations: DecoratedRange[]
  isLast: boolean
  parent: Element
  renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
  renderLeaf?: (props: RenderLeafProps) => JSX.Element
  text: SlateText
}) => {
  const { decorations, isLast, parent, renderPlaceholder, renderLeaf, text } =
    props
  const editor = useSlateStatic()
  const spanRef = ref<HTMLSpanElement | null>(null)
  const leaves = SlateText.decorations(text, decorations)
  const key = ReactEditor.findKey(editor, text)
  const children = []

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
  const callbackRef =
    (span: HTMLSpanElement | null) => {
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      if (span) {
        KEY_TO_ELEMENT?.set(key, span)
        NODE_TO_ELEMENT.set(text, span)
        ELEMENT_TO_NODE.set(span, text)
      } else {
        KEY_TO_ELEMENT?.delete(key)
        NODE_TO_ELEMENT.delete(text)
        if (spanRef.value) {
          ELEMENT_TO_NODE.delete(spanRef.value)
        }
      }
      spanRef.value = span
    }

  return h('span', {
    dataSlateNode: 'text',
    ref: spanRef
  }, children)
}

export default Text
