import { Editor, Text, Path, Element, Node } from 'slate'
import { ReactEditor, useSlateStatic } from '..'
import { IS_ANDROID, IS_IOS } from 'slate-dom'
import { MARK_PLACEHOLDER_SYMBOL } from 'slate-dom'
import { defineComponent, h, onMounted, ref } from 'vue'

/**
 * Leaf content strings.
 */
const String = defineComponent({
  name: 'String',
  props: {
    isLast: {},
    leaf: {},
    parent: {},
    text: {},
  },
  setup(props: {
    isLast: boolean
    leaf: Text
    parent: Element
    text: Text
  }) {
    const { isLast, leaf, parent, text } = props
    const editor = useSlateStatic()
    const path = ReactEditor.findPath(editor, text)
    const parentPath = Path.parent(path)
    const isMarkPlaceholder = Boolean(leaf[MARK_PLACEHOLDER_SYMBOL])

    // COMPAT: Render text inside void nodes with a zero-width space.
    // So the node can contain selection but the text is not visible.
    if (editor.isVoid(parent)) {
      return <ZeroWidthString length={Node.string(parent).length} />
    }

    // COMPAT: If this is the last text node in an empty block, render a zero-
    // width space that will convert into a line break when copying and pasting
    // to support expected plain text.
    if (
      leaf.text === '' &&
      parent.children[parent.children.length - 1] === text &&
      !editor.isInline(parent) &&
      Editor.string(editor, parentPath) === ''
    ) {
      return () => <ZeroWidthString isLineBreak isMarkPlaceholder={isMarkPlaceholder} />
    }

    // COMPAT: If the text is empty, it's because it's on the edge of an inline
    // node, so we render a zero-width space so that the selection can be
    // inserted next to it still.
    if (leaf.text === '') {
      return () => <ZeroWidthString isMarkPlaceholder={isMarkPlaceholder} />
    }

    const spanRef = ref<HTMLSpanElement>()
    const isTrailing = isLast && leaf.text.slice(-1) === '\n'
    const getTextContent = () => {
      return `${leaf.text ?? ''}${isTrailing ? '\n' : ''}`
    }

    onMounted(() => {
      const textWithTrailing = getTextContent()
      if (spanRef.value && spanRef.value?.textContent !== textWithTrailing) {
        spanRef.value.textContent = textWithTrailing
      }
    })

    return () => h('span', {
      'data-slate-string': true,
      ref: spanRef
    }, getTextContent)
  }
})


/**
 * Leaf strings without text, render as zero-width strings.
 */

export const ZeroWidthString = defineComponent({
  props: {
    length: {},
    isLineBreak: {},
    isMarkPlaceholder: {},
  },
  setup(props: {
    length?: number
    isLineBreak?: boolean
    isMarkPlaceholder?: boolean
  }) {
    const { length = 0, isLineBreak = false, isMarkPlaceholder = false } = props

    const attributes: {
      'data-slate-zero-width': string
      'data-slate-length': number
      'data-slate-mark-placeholder'?: boolean
    } = {
      'data-slate-zero-width': isLineBreak ? 'n' : 'z',
      'data-slate-length': length,
    }

    if (isMarkPlaceholder) {
      attributes['data-slate-mark-placeholder'] = true
    }

    return () => (
      <span {...attributes}>
        {!(IS_ANDROID || IS_IOS) || !isLineBreak ? '\uFEFF' : null}
        {isLineBreak ? <br /> : null}
      </span>
    )
  }
})

export default String
