import { direction } from 'direction'
import { DecoratedRange, Editor, Node, Range } from 'slate'
import { Children } from './children'
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
  NODE_TO_INDEX,
  NODE_TO_PARENT,
  DOMEditor,
} from 'slate-dom'
import { TextComp } from './text'
import type { ElementProps, } from './interface'
import type { JSX } from 'vue/jsx-runtime'
import { computed, defineComponent, onMounted, onUnmounted, provide, ref, } from 'vue'
import { useReadOnly } from '../hooks/use-read-only'
import { useDecorate } from '../hooks/use-decorate'
import { SLATE_USE_SELECTED, } from '../constants'

/**
 * Element.
 */
export const ElementComp = defineComponent({
  name: 'slate-element',
  props: ['editor', 'element', 'renderElement', 'renderLeaf', 'renderPlaceholder', 'parentPath', 'parentSelection', 'parentDecorations', 'index'],
  setup(props: ElementProps) {
    const {
      element,
      renderElement,
      renderPlaceholder,
      renderLeaf,
      editor,
      parentPath,
      parentSelection,
      parentDecorations,
      index
    } = props
    const decorate = useDecorate()

    const path = computed(() => parentPath.concat(index))
    const decorations = computed<DecoratedRange[]>(() => {
      const range = Editor.range(editor, path.value)
      const ds = decorate([element, path.value])
      parentDecorations.forEach(dec => {
        ds.push(Range.intersection(dec, range)!)
      })
      return ds
    })

    const selection = computed(() => {
      const p = parentPath.concat(index)
      const range = Editor.range(editor, p)
      return parentSelection && Range.intersection(range, parentSelection)
    })

    const selected = computed(() => !!selection.value)
    provide(SLATE_USE_SELECTED, selected)

    const readOnly = useReadOnly()

    const elementRef = ref<HTMLElement | null>(null)
    onMounted(() => {
      const key = DOMEditor.findKey(editor, element)
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      if (elementRef.value) {
        KEY_TO_ELEMENT?.set(key, elementRef.value)
        NODE_TO_ELEMENT.set(element, elementRef.value)
        ELEMENT_TO_NODE.set(elementRef.value, element)
      }
    })
    onUnmounted(() => {
      const key = DOMEditor.findKey(editor, element)
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor)
      KEY_TO_ELEMENT?.delete(key)
      NODE_TO_ELEMENT.delete(element)
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
      decorations={decorations.value}
      node={element}
      editor={editor}
      renderElement={renderElement}
      renderPlaceholder={renderPlaceholder}
      renderLeaf={renderLeaf}
      selection={selection.value} />

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
            parentPath={path.value}
            parentDecorations={decorations.value}
            isLast={false}
            parent={element}
            text={text}
            renderLeaf={renderLeaf}
            renderPlaceholder={renderPlaceholder}
            editor={editor}
            index={0}

          />
        </Tag>
      )

      NODE_TO_INDEX.set(text, 0)
      NODE_TO_PARENT.set(text, element)
    }

    return () => renderElement({ attributes: attributes.value, children, element })
  }
})



