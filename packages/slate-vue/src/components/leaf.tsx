import { StringComp } from './string'
import {
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  IS_WEBKIT, IS_ANDROID
} from 'slate-dom'
import type { LeafProps, RenderPlaceholderProps } from './interface'
import { computed, defineComponent, Fragment, h, onMounted, onUnmounted, ref, } from 'vue'
import { useRenderLeaf, useRenderPlaceholder } from '../hooks/use-render'

// Delay the placeholder on Android to prevent the keyboard from closing.
// (https://github.com/ianstormtaylor/slate/pull/5368)
const PLACEHOLDER_DELAY = IS_ANDROID ? 300 : 0

/**
 * Individual leaves in a text node with unique formatting.
 */
export const LeafComp = defineComponent({
  name: 'slate-leaf',
  props: ['text', 'leaf', 'parent', 'isLast', 'editor'],
  setup(props: LeafProps) {
    const {
      text,
      leaf,
      isLast,
      parent,
      editor
    } = props

    const placeholderResizeObserver = ref<ResizeObserver | null>(null)
    const placeholderRef = ref<HTMLElement | null>(null)
    const showPlaceholder = ref(false)
    const showPlaceholderTimeoutRef = ref<number>()
    const leafIsPlaceholder = computed(() => Boolean(leaf[PLACEHOLDER_SYMBOL]))

    onMounted(() => {
      if (placeholderRef.value) {
        EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderRef.value)
        placeholderResizeObserver.value = new ResizeObserver(() => {
          leaf.onPlaceholderResize?.(placeholderRef.value)
        })
        placeholderResizeObserver.value.observe(placeholderRef.value)
      }

      if (leafIsPlaceholder.value) {
        showPlaceholderTimeoutRef.value = setTimeout(() => {
          showPlaceholder.value = (true)
          showPlaceholderTimeoutRef.value = undefined
        }, PLACEHOLDER_DELAY)
      }
    })

    onUnmounted(() => {
      EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor)
      placeholderResizeObserver.value?.disconnect()
      placeholderResizeObserver.value = null
      leaf.onPlaceholderResize?.(null)

      clearTimeout(showPlaceholderTimeoutRef.value!)
      showPlaceholderTimeoutRef.value = undefined
    })

    const placeholderProps = computed<RenderPlaceholderProps>(() => ({
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
    })
    )

    const renderLeaf = useRenderLeaf()
    const renderPlaceholder = useRenderPlaceholder()
    
    const children = computed(() =>
      h(Fragment, null, [
        leafIsPlaceholder.value &&
          showPlaceholder.value &&
          renderPlaceholder(placeholderProps.value),
        h(StringComp, {
          editor: editor,
          isLast: isLast,
          leaf: leaf,
          parent: parent,
          text: text,
        }),
      ])
    )

    // COMPAT: Having the `data-` attributes on these leaf elements ensures that
    // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
    // contenteditable behaviors. (2019/05/08)
    return () => renderLeaf({ attributes: { 'data-slate-leaf': true }, children: children.value, leaf, text })
  }
})

