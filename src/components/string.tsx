import { Editor, Text, Path, Element, Node } from 'slate'
import { IS_ANDROID, IS_IOS, DOMEditor, MARK_PLACEHOLDER_SYMBOL, } from 'slate-dom'
import { computed, defineComponent, h, onMounted, ref, toRaw } from 'vue'

/**
 * Leaf content strings.
 */
export const StringComp = defineComponent({
  name: 'slate-string',
  props: ['isLast', 'leaf', 'parent', 'text', 'editor'],
  setup(props: {
    isLast: boolean
    leaf: Text
    parent: Element
    text: Text
    editor: DOMEditor
  }) {
    const { isLast, leaf, parent, text, editor } = props

    const path = DOMEditor.findPath(editor, toRaw(text))
    const parentPath = Path.parent(path)
    const isMarkPlaceholder = Boolean(leaf[MARK_PLACEHOLDER_SYMBOL])

    // COMPAT: Render text inside void nodes with a zero-width space.
    // So the node can contain selection but the text is not visible.
    if (editor.isVoid(parent)) {
      return () => h(ZeroWidthString, { length: Node.string(parent).length })
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
      return () => h(ZeroWidthString, { isLineBreak: true, isMarkPlaceholder: isMarkPlaceholder })
    }

    // COMPAT: If the text is empty, it's because it's on the edge of an inline
    // node, so we render a zero-width space so that the selection can be
    // inserted next to it still.
    if (leaf.text === '') {
      return () => h(ZeroWidthString, { isMarkPlaceholder: isMarkPlaceholder })
    }

    const textRef = ref<HTMLSpanElement>()
    const isTrailing = isLast && leaf.text.slice(-1) === '\n'
    const getTextContent = computed(() => {
      return `${leaf.text ?? ''}${isTrailing ? '\n' : ''}`
    })

    onMounted(() => {
      const textWithTrailing = getTextContent.value
      if (textRef.value && textRef.value?.textContent !== textWithTrailing) {
        textRef.value.textContent = textWithTrailing
      }
    })

    return () => h('span', {
      'data-slate-string': true,
      ref: textRef
    }, getTextContent.value)
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

