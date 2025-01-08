import { direction } from 'direction'
import {
  Editor,
  Element,
  Node,
  Range,
  type DecoratedRange,
} from 'slate'
import { Children } from './children'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  DOMEditor,
} from '../slate-dom'
import { TextComp } from './text'
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from './interface'
import type { JSX } from 'vue/jsx-runtime'
import { computed, defineComponent, inject, onMounted, onUnmounted, ref, toRaw, } from 'vue'
import { useReadOnly } from '../hooks/use-read-only'

/**
 * Element.
 */
export const ElementComp = defineComponent({
  name: 'slate-element',
  props: ['decorations', 'element', 'renderElement', 'renderPlaceholder', 'renderLeaf', 'selection'],
  setup(props: {
    element: Element
    decorations: DecoratedRange[]
    renderElement: (props: RenderElementProps) => JSX.Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => JSX.Element
    selection: Range | null
  }) {
    const {
      element,
      decorations,
      renderElement,
      renderPlaceholder,
      renderLeaf,
      selection,
    } = props
    const editor = toRaw(inject("editorRef")) as DOMEditor;
    const readOnly = useReadOnly()
    const rawElement = toRaw(element)

    const elementRef = ref<HTMLElement | null>(null)
    onMounted(() => {
      const key = DOMEditor.findKey(editor, rawElement)
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      if (elementRef.value) {
        KEY_TO_ELEMENT?.set(key, elementRef.value)
        NODE_TO_ELEMENT.set(rawElement, elementRef.value)
        ELEMENT_TO_NODE.set(elementRef.value, rawElement)
      }
    })
    onUnmounted(() => {
      const key = DOMEditor.findKey(editor, rawElement)
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(rawElement)
    })

    const isInline = computed(() => editor.isInline(element))
    // Attributes that the developer must mix into the element in their
    // custom node renderer component.
    const attributes = computed(() => {
      const attr: {
        'data-slate-node': 'element'
        'data-slate-void'?: true
        'data-slate-inline'?: true
        contentEditable?: false
        dir?: 'rtl'
        ref: any
      } = {
        'data-slate-node': 'element',
        ref: elementRef,
      }

      if (isInline.value) {
        attr['data-slate-inline'] = true
      }

      // If it's a block node with inline children, add the proper `dir` attribute
      // for text direction.
      if (!isInline.value && Editor.hasInlines(editor, element)) {
        const text = Node.string(element)
        const dir = direction(text)

        if (dir === 'rtl') {
          attr.dir = dir
        }
      }

      if (Editor.isVoid(editor, element)) {
        attr['data-slate-void'] = true

        if (!readOnly && isInline.value) {
          attr.contentEditable = false
        }
      }
      return attr
    })

    let children: JSX.Element = <Children
      decorations={decorations}
      node={element}
      renderElement={renderElement}
      renderPlaceholder={renderPlaceholder}
      renderLeaf={renderLeaf}
      selection={selection} />

    // If it's a void node, wrap the children in extra void-specific elements.
    if (Editor.isVoid(editor, element)) {

      const Tag = isInline.value ? 'span' : 'div'
      const [[text]] = Node.texts(element)

      children = (
        <Tag
          data-slate-spacer
          style={{
            height: '0',
            color: 'transparent',
            outline: 'none',
            position: 'absolute',
          }}
        >
          <TextComp
            renderPlaceholder={renderPlaceholder}
            renderLeaf={renderLeaf}
            decorations={decorations}
            isLast={false}
            parent={element}
            text={text}
          />
        </Tag>
      )

      NODE_TO_INDEX.set(text, 0)
      NODE_TO_PARENT.set(text, rawElement)
    }

    return () => renderElement({ attributes: attributes.value, children, element })
  }
})



