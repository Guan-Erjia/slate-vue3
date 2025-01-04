import { Element, Text } from 'slate'
import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer'
import String from './string'
import {
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
} from 'slate-dom'
import { useSlateStatic } from '../hooks/use-slate-static'
import { IS_WEBKIT, IS_ANDROID } from 'slate-dom'
import type { RenderLeafProps, RenderPlaceholderProps } from './interface'
import type { JSX } from 'vue/jsx-runtime'
import { defineComponent, h, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// Delay the placeholder on Android to prevent the keyboard from closing.
// (https://github.com/ianstormtaylor/slate/pull/5368)
const PLACEHOLDER_DELAY = IS_ANDROID ? 300 : 0

function disconnectPlaceholderResizeObserver(
  placeholderResizeObserver: Ref<ResizeObserver | null>,
  releaseObserver: boolean
) {
  if (placeholderResizeObserver.value) {
    placeholderResizeObserver.value.disconnect()
    if (releaseObserver) {
      placeholderResizeObserver.value = null
    }
  }
}

type TimerId = ReturnType<typeof setTimeout> | null

function clearTimeoutRef(timeoutRef: Ref<TimerId>) {
  if (timeoutRef.value) {
    clearTimeout(timeoutRef.value)
    timeoutRef.value = null
  }
}

/**
 * Individual leaves in a text node with unique formatting.
 */

const Leaf = defineComponent({
  name: 'Leaf',
  setup(props: {
    isLast: boolean
    leaf: Text
    parent: Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf?: (props: RenderLeafProps) => JSX.Element
    text: Text
  }) {
    const {
      leaf,
      isLast,
      text,
      parent,
      renderPlaceholder,
      renderLeaf = (props: RenderLeafProps) => <DefaultLeaf {...props} />,
    } = props


    const editor = useSlateStatic()
    const placeholderResizeObserver = ref<ResizeObserver | null>(null)
    const placeholderRef = ref<HTMLElement | null>(null)
    const showPlaceholder = ref(false)
    const showPlaceholderTimeoutRef = ref<TimerId>(null)

    const callbackPlaceholderRef =
      (placeholderEl: HTMLElement | null) => {
        disconnectPlaceholderResizeObserver(
          placeholderResizeObserver,
          placeholderEl == null
        )

        if (placeholderEl == null) {
          EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor)
          leaf.onPlaceholderResize?.(null)
        } else {
          EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderEl)

          if (!placeholderResizeObserver.value) {
            // Create a new observer and observe the placeholder element.
            const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill
            placeholderResizeObserver.value = new ResizeObserver(() => {
              leaf.onPlaceholderResize?.(placeholderEl)
            })
          }
          placeholderResizeObserver.value.observe(placeholderEl)
          placeholderRef.value = placeholderEl
        }
      }

    let children = (
      <String isLast={isLast} leaf={leaf} parent={parent} text={text} />
    )

    const leafIsPlaceholder = Boolean(leaf[PLACEHOLDER_SYMBOL])
    onMounted(() => {
      if (leafIsPlaceholder) {
        if (!showPlaceholderTimeoutRef.value) {
          // Delay the placeholder, so it will not render in a selection
          showPlaceholderTimeoutRef.value = setTimeout(() => {
            showPlaceholder.value = (true)
            showPlaceholderTimeoutRef.value = null
          }, PLACEHOLDER_DELAY)
        }
      } else {
        clearTimeoutRef(showPlaceholderTimeoutRef)
        showPlaceholder.value = (false)
      }
    })
    onBeforeUnmount(() => [
      clearTimeoutRef(showPlaceholderTimeoutRef)
    ])

    if (leafIsPlaceholder && showPlaceholder) {
      const placeholderProps: RenderPlaceholderProps = {
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
          ref: callbackPlaceholderRef,
        },
      }

      children = (
        <>
          {renderPlaceholder(placeholderProps)}
          {children}
        </>
      )
    }

    // COMPAT: Having the `data-` attributes on these leaf elements ensures that
    // in certain misbehaving browsers they aren't weirdly cloned/destroyed by
    // contenteditable behaviors. (2019/05/08)
    const attributes: {
      'data-slate-leaf': true
    } = {
      'data-slate-leaf': true,
    }

    return renderLeaf({ attributes, children, leaf, text })
  }
})

export const DefaultLeaf = (props: RenderLeafProps) => {
  const { attributes, children } = props
  return h('span', attributes, children)
}

export default Leaf
