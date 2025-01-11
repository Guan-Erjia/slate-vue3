import { Element, Text } from 'slate'
import { StringComp } from './string'
import {
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  DOMEditor,
  IS_WEBKIT, IS_ANDROID
} from 'slate-dom'
import type { RenderLeafProps, RenderPlaceholderProps } from './interface'
import type { JSX } from 'vue/jsx-runtime'
import { computed, defineComponent, onMounted, onUnmounted, ref, type VNode, } from 'vue'

// Delay the placeholder on Android to prevent the keyboard from closing.
// (https://github.com/ianstormtaylor/slate/pull/5368)
const PLACEHOLDER_DELAY = IS_ANDROID ? 300 : 0

/**
 * Individual leaves in a text node with unique formatting.
 */
export const LeafComp = defineComponent({
  name: 'slate-leaf',
  props:
  {
    isLast: Boolean,
    leaf: Object,
    parent: Object,
    renderPlaceholder: Function,
    renderLeaf: Function,
    text: Object,
    editor: Object
  },
  setup(props: {
    isLast: boolean
    leaf: Text
    parent: Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => VNode
    text: Text
    editor: DOMEditor
  }) {
    const {
      leaf,
      isLast,
      text,
      parent,
      renderPlaceholder,
      renderLeaf,
      editor
    } = props

    const placeholderResizeObserver = ref<ResizeObserver | null>(null)
    const placeholderRef = ref<HTMLElement | null>(null)
    const showPlaceholder = ref(false)
    const showPlaceholderTimeoutRef = ref<number | null>(null)
    const leafIsPlaceholder = Boolean(leaf[PLACEHOLDER_SYMBOL])

    onMounted(() => {
      if (placeholderRef.value) {
        EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderRef.value)
        placeholderResizeObserver.value = new ResizeObserver(() => {
          leaf.onPlaceholderResize?.(placeholderRef.value)
        })
        placeholderResizeObserver.value.observe(placeholderRef.value)
      }

      if (leafIsPlaceholder) {
        showPlaceholderTimeoutRef.value = setTimeout(() => {
          showPlaceholder.value = (true)
          showPlaceholderTimeoutRef.value = null
        }, PLACEHOLDER_DELAY)
      }
    })

    onUnmounted(() => {
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor)
      placeholderResizeObserver.value?.disconnect()
      placeholderResizeObserver.value = null
      leaf.onPlaceholderResize?.(null)

      clearTimeout(showPlaceholderTimeoutRef.value!)
      showPlaceholderTimeoutRef.value = null
    })

    const placeholderProps = computed<RenderPlaceholderProps>(() => {
      return {
        children: leaf.placeholder,
        attributes: {
          'data-slate-placeholder': true,
          style: {
            position: 'absolute',
            top: 0,
            pointerEvents: 'none',
            width: '100%',
            maxWidth: '100%',
            display: 'block',
            opacity: '0.333',
            userSelect: 'none',
            textDecoration: 'none',
            // Fixes https://github.com/udecode/plate/issues/2315
            WebkitUserModify: IS_WEBKIT ? 'inherit' : undefined,
          },
          contentEditable: false,
          ref: placeholderRef,
        },
      }
    })

    let children = (
      <>
        {leafIsPlaceholder && showPlaceholder.value && renderPlaceholder(placeholderProps.value)}
        <StringComp editor={editor} isLast={isLast} leaf={leaf} parent={parent} text={text} />
      </>
    )

    // COMPAT: Having the `data-` attributes on these leaf elements ensures that
    // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
    // contenteditable behaviors. (2019/05/08)
    const attributes: {
      'data-slate-leaf': true
    } = {
      'data-slate-leaf': true,
    }

    return () => renderLeaf({ attributes, children, leaf, text })
  }
})

