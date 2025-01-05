import {
  type Ancestor,
  type Descendant,
  type DecoratedRange,
} from 'slate'
import {
  Editor,
  Element,
  Range,
} from 'slate'


import ElementComponent from '../components/element'
import TextComponent from '../components/text'
import { ReactEditor } from '../plugin/react-editor'
import { IS_NODE_MAP_DIRTY, NODE_TO_ELEMENT, NODE_TO_INDEX, NODE_TO_KEY, NODE_TO_PARENT } from 'slate-dom'
import { useDecorate } from '../hooks/use-decorate'
import { useSlateStatic } from '../hooks/use-slate-static'
import type { JSX } from 'vue/jsx-runtime'
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from '../components/interface'
import { defineComponent } from 'vue'

/**
 * Children.
 */

const Children = defineComponent({
  name: 'Children',
  props: {
    decorations: {},
    node: {},
    renderElement: {},
    renderPlaceholder: {},
    renderLeaf: {},
    selection: {},
  },
  setup(props: {
    decorations: DecoratedRange[]
    node: Ancestor
    renderElement?: (props: RenderElementProps) => JSX.Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf?: (props: RenderLeafProps) => JSX.Element
    selection: Range | null
  }) {
    const {
      decorations,
      node,
      renderElement,
      renderPlaceholder,
      renderLeaf,
      selection,
    } = props
    const decorate = useDecorate()
    const editor = useSlateStatic()
    console.log(editor.children)
    IS_NODE_MAP_DIRTY.set(editor as ReactEditor, false)
    const children: JSX.Element[] = []
    console.log(NODE_TO_PARENT,NODE_TO_INDEX,NODE_TO_ELEMENT,NODE_TO_KEY, editor)
    const path = ReactEditor.findPath(editor, node)
    const isLeafBlock =
      Element.isElement(node) &&
      !editor.isInline(node) &&
      Editor.hasInlines(editor, node)

    for (let i = 0; i < node.children.length; i++) {
      const p = path.concat(i)
      const n = node.children[i] as Descendant
      const key = ReactEditor.findKey(editor, n)
      const range = Editor.range(editor, p)
      const sel = selection && Range.intersection(range, selection)
      const ds = decorate([n, p])

      for (const dec of decorations) {
        const d = Range.intersection(dec, range)

        if (d) {
          ds.push(d)
        }
      }

      if (Element.isElement(n)) {
        children.push(
          <ElementComponent
            decorations={ds}
            element={n}
            key={key.id}
            renderElement={renderElement}
            renderPlaceholder={renderPlaceholder}
            renderLeaf={renderLeaf}
            selection={sel}
          />
        )
      } else {
        children.push(
          <TextComponent
            decorations={ds}
            key={key.id}
            isLast={isLeafBlock && i === node.children.length - 1}
            parent={node}
            renderPlaceholder={renderPlaceholder}
            renderLeaf={renderLeaf}
            text={n}
          />
        )
      }

      NODE_TO_INDEX.set(n, i)
      NODE_TO_PARENT.set(n, node)
    }

    return () => children
  }
})

export default Children
