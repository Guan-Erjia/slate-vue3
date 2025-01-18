import {
  Editor,
  Element,
  Range,
} from 'slate'
import { ElementComp } from './element'
import { TextComp } from './text'
import { DOMEditor, IS_NODE_MAP_DIRTY, NODE_TO_INDEX, NODE_TO_PARENT } from 'slate-dom'
import { useDecorate } from '../hooks/use-decorate'
import type { ChildrenProps } from './interface'
import { computed, defineComponent, onUpdated, toRaw, } from 'vue'

/**
 * Children.
 */
export const Children = defineComponent({
  name: 'Children',
  props: ['node', 'decorations', 'renderElement', 'renderPlaceholder', 'renderLeaf', 'selection', 'editor'],
  setup(props: ChildrenProps) {
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
    const rawEditor = toRaw(editor)

    // 更新成功后可信任 selection
    onUpdated(() => {
      IS_NODE_MAP_DIRTY.set(rawEditor, false)
    })

    const path = computed(() => DOMEditor.findPath(editor, toRaw(node)))
    const isLeafBlock = computed(() => Element.isElement(node) &&
      !editor.isInline(node) &&
      Editor.hasInlines(editor, node))

    return () => node.children.map((child, i) => {
      const rawChild = toRaw(child)
      const key = DOMEditor.findKey(rawEditor, rawChild)
      NODE_TO_INDEX.set(rawChild, i)
      NODE_TO_PARENT.set(rawChild, toRaw(node))

      const p = path.value.concat(i)
      const range = Editor.range(editor, p)
      const ds = decorate([child, p])
      decorations.forEach(dec => {
        const d = Range.intersection(dec, range)
        if (d) {
          ds.push(d)
        }
      })

      return Element.isElement(child) ? <ElementComp
        element={child}
        key={key.id}
        index={i}
        parentPath={path.value}
        parentSelection={selection}
        parentDecorations={decorations}
        editor={editor}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
      /> : <TextComp
        decorations={ds}
        text={child}
        key={key.id}
        isLast={isLeafBlock.value && i === node.children.length - 1}
        parent={node}
        editor={editor}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
      />
    })
  }
})