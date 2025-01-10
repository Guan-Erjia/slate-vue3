import type { Ancestor, DecoratedRange, Text, } from 'slate'
import {
  Editor,
  Element,
  Range,
} from 'slate'
import { ElementComp } from './element'
import { TextComp } from './text'
import { DOMEditor, IS_NODE_MAP_DIRTY, NODE_TO_INDEX, NODE_TO_PARENT } from 'slate-dom'
import { useDecorate } from '../hooks/use-decorate'
import type { JSX } from 'vue/jsx-runtime'
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from './interface'
import { computed, defineComponent, toRaw, } from 'vue'

/**
 * Children.
 */
export const Children = defineComponent({
  name: 'Children',
  props: {
    decorations: {},
    node: {},
    renderElement: {},
    renderPlaceholder: {},
    renderLeaf: {},
    selection: {},
    refNode: {},
    editor: {}
  },
  setup(props: {
    node: Ancestor
    renderElement: (props: RenderElementProps) => JSX.Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => JSX.Element
    selection: Range | null
    decorations: DecoratedRange[]
    editor: DOMEditor
  }) {
    const {
      editor,
      decorations,
      node,
      renderElement,
      renderPlaceholder,
      renderLeaf,
      selection,
    } = props
    const decorate = useDecorate()
    const getRawEditor = () => toRaw(editor)

    IS_NODE_MAP_DIRTY.set(getRawEditor(), false)

    const path = DOMEditor.findPath(editor, toRaw(node))
    const isLeafBlock = computed(() => Element.isElement(node) &&
      !editor.isInline(node) &&
      Editor.hasInlines(editor, node))

    return () => node.children.map((child, i) => {
      const n = toRaw(node.children[i])
      const p = path.concat(i)
      const key = DOMEditor.findKey(getRawEditor(), n)
      const range = Editor.range(editor, p)
      const sel = selection && Range.intersection(range, selection)
      const ds = decorate([n, p])
      decorations.forEach(dec => {
        const d = Range.intersection(dec, range)
        if (d) {
          ds.push(d)
        }
      })
      NODE_TO_INDEX.set(n, i)
      NODE_TO_PARENT.set(n, toRaw(node))
      return Element.isElement(child) ? <ElementComp
        decorations={ds}
        element={n as Element}
        refElement={child}
        key={key.id}
        renderElement={renderElement}
        renderPlaceholder={renderPlaceholder}
        renderLeaf={renderLeaf}
        selection={sel}
        editor={editor}
      /> : <TextComp
        decorations={ds}
        text={n as Text}
        refText={child}
        key={key.id}
        isLast={isLeafBlock.value && i === node.children.length - 1}
        parent={node}
        renderPlaceholder={renderPlaceholder}
        renderLeaf={renderLeaf}
        editor={editor}
      />
    })
  }
})