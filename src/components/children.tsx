import type { Ancestor, DecoratedRange, } from 'slate'
import {
  Editor,
  Element,
  Range,
} from 'slate'
import { ElementComp } from './element'
import { TextComp } from './text'
import { DOMEditor } from '../plugin/react-editor'
import { IS_NODE_MAP_DIRTY, NODE_TO_INDEX, NODE_TO_PARENT } from '../slate-dom'
import { useDecorate } from '../hooks/use-decorate'
import type { JSX } from 'vue/jsx-runtime'
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from './interface'
import { defineComponent, inject, ref, toRaw, watch, type Ref } from 'vue'

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
  },
  setup(props: {
    decorations: DecoratedRange[]
    node: Ancestor
    renderElement: (props: RenderElementProps) => JSX.Element
    renderPlaceholder: (props: RenderPlaceholderProps) => JSX.Element
    renderLeaf: (props: RenderLeafProps) => JSX.Element
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
    const editor = toRaw(inject("editorRef")) as DOMEditor;
    const editorVersion = inject<Ref<number>>("editorVersion")
    IS_NODE_MAP_DIRTY.set(editor as DOMEditor, false)

    const path = DOMEditor.findPath(editor, toRaw(node))
    const isLeafBlock =
      Element.isElement(node) &&
      !editor.isInline(node) &&
      Editor.hasInlines(editor, node)

    const nodeChildren = ref(node.children)
    watch(() => editorVersion?.value, () => {
      nodeChildren.value = node.children
    })

    return () => nodeChildren.value.map((child, i) => {
      const n = toRaw(child)
      const p = path.concat(i)
      const key = DOMEditor.findKey(editor, toRaw(n))
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
        element={child}
        key={key.id}
        renderElement={renderElement}
        renderPlaceholder={renderPlaceholder}
        renderLeaf={renderLeaf}
        selection={sel}
      /> : <TextComp
        decorations={ds}
        key={key.id}
        isLast={isLeafBlock && i === node.children.length - 1}
        parent={node}
        renderPlaceholder={renderPlaceholder}
        renderLeaf={renderLeaf}
        text={child}
      />
    })
  }
})