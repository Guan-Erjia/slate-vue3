import { Element, Text } from 'slate'
import { StringComp } from './string'
import {
  PLACEHOLDER_SYMBOL,
  EDITOR_TO_PLACEHOLDER_ELEMENT,
  DOMEditor,
} from '../slate-dom'
import { IS_WEBKIT, IS_ANDROID } from '../slate-dom'
import type { RenderLeafProps, RenderPlaceholderProps } from './interface'
import type { JSX } from 'vue/jsx-runtime'
import { computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, toRaw, type Ref, type VNode, type VNodeRef } from 'vue'

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
  },
  setup(props: {
    isLast: boolean
    leaf: Text
    parent: Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => VNode
    text: Text
  }) {
    const {
      leaf,
      isLast,
      text,
      parent,
      renderPlaceholder,
      renderLeaf,
    } = props
    const editor = toRaw(inject("editorRef")) as DOMEditor;

    const placeholderResizeObserver = ref<ResizeObserver | null>(null)
    const placeholderRef = ref<HTMLElement | null>(null)
    const showPlaceholder = ref(false)
    const showPlaceholderTimeoutRef = ref<TimerId>(null)

    const callbackPlaceholderRef: VNodeRef =
      (placeholderEl) => {
        disconnectPlaceholderResizeObserver(
          placeholderResizeObserver,
          placeholderEl == null
        )

        if (placeholderEl == null) {
          EDITOR_TO_PLACEHOLDER_ELEMENT.delete(editor)
          leaf.onPlaceholderResize?.(null)
        } else if (placeholderEl instanceof HTMLElement) {
          EDITOR_TO_PLACEHOLDER_ELEMENT.set(editor, placeholderEl)

          if (!placeholderResizeObserver.value) {
            // Create a new observer and observe the placeholder element.
            placeholderResizeObserver.value = new ResizeObserver(() => {
              leaf.onPlaceholderResize?.(placeholderEl)
            })
          }
          placeholderResizeObserver.value.observe(placeholderEl)
          placeholderRef.value = placeholderEl
        }
      }



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

    let children = (
      <StringComp isLast={isLast} leaf={leaf} parent={parent} text={text} />
    )

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
          ref: callbackPlaceholderRef,
        },
      }
    })

    if (leafIsPlaceholder && showPlaceholder) {
      children = (
        <>
          {renderPlaceholder(placeholderProps.value)}
          <StringComp isLast={isLast} leaf={leaf} parent={parent} text={text} />
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

    return () => renderLeaf({ attributes, children, leaf, text })
  }
})

