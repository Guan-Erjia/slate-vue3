import { direction } from 'direction'
import {
  Editor,
  Element as SlateElement,
  Node,
  Range,
  type DecoratedRange,
} from 'slate'
import { ReactEditor, useReadOnly, useSlateStatic } from '..'
import { Children } from './children'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
} from '../slate-dom'
import { TextComp } from './text'
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from './interface'
import type { JSX } from 'vue/jsx-runtime'
import { defineComponent, inject, onMounted, ref, toRaw } from 'vue'


export const DefaultElement = defineComponent({
  name: 'DefaultElement',
  props: {
    children: {},
    element: {},
    attributes: {},
  },
  setup(props: RenderElementProps) {
    const { attributes, children, element } = props
    const editor = inject("editorRef") as Editor;
    const Tag = editor.isInline(element) ? 'span' : 'div'
    return () => <Tag {...attributes} style={{ position: 'relative' }}>
      {children}
    </Tag>
  }
})



/**
 * Element.
 */
export const ElementComp = defineComponent({
  name: 'Element',
  props: {
    decorations: {},
    element: {},
    renderElement: {},
    renderPlaceholder: {},
    renderLeaf: {},
    selection: {},
  },
  setup(props: {
    decorations: DecoratedRange[]
    element: SlateElement
    renderElement?: (props: RenderElementProps) => JSX.Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf?: (props: RenderLeafProps) => JSX.Element
    selection: Range | null
  }) {
    const {
      decorations,
      element,
      renderElement = (p: RenderElementProps) => <DefaultElement {...p} />,
      renderPlaceholder,
      renderLeaf,
      selection,
    } = props
    const editor = useSlateStatic()
    const readOnly = useReadOnly()
    const isInline = editor.isInline(element)
    const key = ReactEditor.findKey(editor, toRaw(element))
    const elemRef = ref(null)
    onMounted(() => {
      // Update element-related weak maps with the DOM element ref.
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      if (elemRef.value) {
        KEY_TO_ELEMENT?.set(key, elemRef.value)
        NODE_TO_ELEMENT.set(element, elemRef.value)
        ELEMENT_TO_NODE.set(elemRef.value, element)
      } else {
        KEY_TO_ELEMENT?.delete(key)
        NODE_TO_ELEMENT.delete(element)
      }
    })

    let children: JSX.Element = <Children
      decorations={decorations}
      node={element}
      renderElement={renderElement}
      renderPlaceholder={renderPlaceholder}
      renderLeaf={renderLeaf}
      selection={selection} />

    // Attributes that the developer must mix into the element in their
    // custom node renderer component.
    const attributes: {
      'data-slate-node': 'element'
      'data-slate-void'?: true
      'data-slate-inline'?: true
      contentEditable?: false
      dir?: 'rtl'
      ref: any
    } = {
      'data-slate-node': 'element',
      ref: elemRef,
    }

    if (isInline) {
      attributes['data-slate-inline'] = true
    }

    // If it's a block node with inline children, add the proper `dir` attribute
    // for text direction.
    if (!isInline && Editor.hasInlines(editor, element)) {
      const text = Node.string(element)
      const dir = direction(text)

      if (dir === 'rtl') {
        attributes.dir = dir
      }
    }

    // If it's a void node, wrap the children in extra void-specific elements.
    if (Editor.isVoid(editor, element)) {
      attributes['data-slate-void'] = true

      if (!readOnly && isInline) {
        attributes.contentEditable = false
      }

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

    return () => renderElement({ attributes, children, element })
  }
})



