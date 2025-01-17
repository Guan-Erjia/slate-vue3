import { DecoratedRange, Editor, Text, Range } from 'slate'
import {
  DOMEditor,
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from 'slate-dom'
import { LeafComp } from './leaf'
import type { TextProps } from './interface'
import { computed, defineComponent, h, onMounted, onUnmounted, ref } from 'vue'
import { useDecorate } from '../hooks/use-decorate'

/**
 * Text.
 */
export const TextComp = defineComponent({
  name: 'slate-text',
  props: ['text', 'parent', 'parentPath', 'parentDecorations', 'editor', 'isLast', 'renderLeaf', 'renderPlaceholder', 'index'],
  setup(props: TextProps) {
    const { text, parent, parentPath, parentDecorations, editor, isLast, renderLeaf, renderPlaceholder, index } = props
    const spanRef = ref<HTMLSpanElement>()
    const decorate = useDecorate()
    const path = computed(() => parentPath.concat(index))

    const decorations = computed<DecoratedRange[]>(() => {
      const range = Editor.range(editor, path.value)
      const ds = decorate([text, path.value])
      parentDecorations.forEach(dec => {
        ds.push(Range.intersection(dec, range)!)
      })
      return ds
    })

    const leaves = Text.decorations(text, decorations.value)
    const key = DOMEditor.findKey(editor, text)

    onMounted(() => {
      const key = DOMEditor.findKey(editor, text)
      if (spanRef.value) {
        const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
        KEY_TO_ELEMENT?.set(key, spanRef.value)
        ELEMENT_TO_NODE.set(spanRef.value, text)
        NODE_TO_ELEMENT.set(text, spanRef.value)
      }
    })

    onUnmounted(() => {
      const key = DOMEditor.findKey(editor, text)
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
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
      text,
      leaf,
      parent,
      editor,
      isLast: isLast && i === leaves.length - 1,
      key: `${key.id}-${i}`,
      renderLeaf,
      renderPlaceholder,
    })))
  }
})


