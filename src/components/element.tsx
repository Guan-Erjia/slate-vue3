import { direction } from 'direction'
import {
  Editor,
  Element as SlateElement,
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
import { computed, defineComponent, inject, toRaw, type VNodeRef } from 'vue'
import { useReadOnly } from '../hooks/use-read-only'

/**
 * Element.
 */
export const ElementComp = defineComponent({
  name: 'slate-element',
  props: ['decorations', 'element', 'renderElement', 'renderPlaceholder', 'renderLeaf', 'selection'],
  setup(props: {
    decorations: DecoratedRange[]
    element: SlateElement
    renderElement: (props: RenderElementProps) => JSX.Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => JSX.Element
    selection: Range | null
  }) {
    const {
      decorations,
      element,
      renderElement,
      renderPlaceholder,
      renderLeaf,
      selection,
    } = props
    const editor = inject("editorRef") as DOMEditor;
    const readOnly = useReadOnly()
    const isInline = editor.isInline(element)
    const key = DOMEditor.findKey(editor, toRaw(element))

    const elementRef: VNodeRef = (ref) => {
      // Update element-related weak maps with the DOM element ref.
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      if (ref instanceof HTMLElement) {
        KEY_TO_ELEMENT?.set(key, ref)
        NODE_TO_ELEMENT.set(element, ref)
        ELEMENT_TO_NODE.set(ref, element)
      } else if (ref === null) {
        KEY_TO_ELEMENT?.delete(key)
        NODE_TO_ELEMENT.delete(element)
      }
    }

    let children: JSX.Element = <Children
      decorations={decorations}
      node={element}
      renderElement={renderElement}
      renderPlaceholder={renderPlaceholder}
      renderLeaf={renderLeaf}
      selection={selection} />

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

      if (isInline) {
        attr['data-slate-inline'] = true
      }

      // If it's a block node with inline children, add the proper `dir` attribute
      // for text direction.
      if (!isInline && Editor.hasInlines(editor, element)) {
        const text = Node.string(element)
        const dir = direction(text)

        if (dir === 'rtl') {
          attr.dir = dir
        }
      }

      if (Editor.isVoid(editor, element)) {
        attr['data-slate-void'] = true

        if (!readOnly && isInline) {
          attr.contentEditable = false
        }
      }
      return attr
    })





    // If it's a void node, wrap the children in extra void-specific elements.
    if (Editor.isVoid(editor, element)) {

      const Tag = isInline ? 'span' : 'div'
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
            decorations={[]}
            isLast={false}
            parent={element}
            text={text}
          />
        </Tag>
      )

      NODE_TO_INDEX.set(text, 0)
      NODE_TO_PARENT.set(text, element)
    }

    return () => renderElement({ attributes: attributes.value, children, element })
  }
})



