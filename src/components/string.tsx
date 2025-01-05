import { Editor, Text, Path, Element, Node } from 'slate'
import { ReactEditor, useSlateStatic } from '..'
import { IS_ANDROID, IS_IOS } from 'slate-dom'
import { MARK_PLACEHOLDER_SYMBOL } from 'slate-dom'
import { defineComponent, h, onMounted, ref } from 'vue'

/**
 * Leaf content strings.
 */
const String = defineComponent({
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

    // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
    // so we need to add an extra trailing new lines to prevent that.
    return () => <TextString isTrailing={isLast && leaf.text.slice(-1) === '\n'} text={leaf.text} />
  }
})

/**
 * Leaf strings with text in them.
 */
const TextString = defineComponent({
  props: { text: {}, isTrailing: {} },
  setup(props: { text: string; isTrailing?: boolean }) {
    const { text, isTrailing = false } = props
    const spanRef = ref<HTMLSpanElement>()
    const getTextContent = () => {
      return `${text ?? ''}${isTrailing ? '\n' : ''}`
    }
    const initialText = ref(getTextContent)

    // This is the actual text rendering boundary where we interface with the DOM
    // The text is not rendered as part of the virtual DOM, as since we handle basic character insertions natively,
    // updating the DOM is not a one way dataflow anymore. What we need here is not reconciliation and diffing
    // with previous version of the virtual DOM, but rather diffing with the actual DOM element, and replace the DOM <span> content
    // exactly if and only if its current content does not match our current virtual DOM.
    // Otherwise the DOM TextNode would always be replaced by React as the user types, which interferes with native text features,
    // eg makes native spellcheck opt out from checking the text node.

    // useLayoutEffect: updating our span before browser paint
    onMounted(() => {
      // null coalescing text to make sure we're not outputing "null" as a string in the extreme case it is nullish at runtime
      const textWithTrailing = getTextContent()

      if (spanRef.value && spanRef.value?.textContent !== textWithTrailing) {
        spanRef.value.textContent = textWithTrailing
      }

      // intentionally not specifying dependencies, so that this effect runs on every render
      // as this effectively replaces "specifying the text in the virtual DOM under the <span> below" on each render
    })

    // We intentionally render a memoized <span> that only receives the initial text content when the component is mounted.
    // We defer to the layout effect above to update the `textContent` of the span element when needed.
    return () => h('span', {
      dataSlateString: true,
      ref: spanRef
    }, initialText.value)
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
