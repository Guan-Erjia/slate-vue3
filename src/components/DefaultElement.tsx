import type { Editor } from 'slate'
import type { RenderElementProps } from './interface'
import { defineComponent, inject } from 'vue'

/**
 * The default element renderer.
 */
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

