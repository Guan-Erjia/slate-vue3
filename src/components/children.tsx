import {
  Editor,
  Element,
} from 'slate'
import { ElementComp } from './element'
import { TextComp } from './text'
import { DOMEditor, IS_NODE_MAP_DIRTY, NODE_TO_INDEX, NODE_TO_PARENT } from 'slate-dom'
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
    const rawEditor = toRaw(editor)

    // 更新成功后可信任 selection
    onUpdated(() => {
      IS_NODE_MAP_DIRTY.set(rawEditor, false)
    })

    const path = computed(() => DOMEditor.findPath(editor, toRaw(node)))
    const isLeafBlock = computed(() =>
      Element.isElement(node) &&
      !editor.isInline(node) &&
      Editor.hasInlines(editor, node))

    return () => node.children.map((child, i) => {
      // 这些逻辑不会触发多余渲染
      const rawChild = toRaw(child)
      const key = DOMEditor.findKey(rawEditor, rawChild)
      NODE_TO_INDEX.set(rawChild, i)
      NODE_TO_PARENT.set(rawChild, toRaw(node))

      return Element.isElement(child) ? <ElementComp
        element={child}
        parentPath={path.value}
        parentSelection={selection}
        parentDecorations={decorations}
        editor={editor}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        index={i}
        key={key.id}
        /> : <TextComp
        text={child}
        parent={node}
        isLast={isLeafBlock.value && i === node.children.length - 1}
        editor={editor}
        parentPath={path.value}
        parentDecorations={decorations}
        renderLeaf={renderLeaf}
        renderPlaceholder={renderPlaceholder}
        index={i}
        key={key.id}
      />
    })
  }
})