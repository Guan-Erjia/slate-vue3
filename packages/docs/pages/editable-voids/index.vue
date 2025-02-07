<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Toolbar>
      <InsertEditableVoidButton />
    </Toolbar>
    <Editable placeholder="Enter some text..." />
  </Slate>
</template>
<script lang="ts" setup>
import { createEditor, Descendant, withDOM, Slate, Editable, RenderElementProps, defaultRenderLeaf, defaultRenderPlaceHolder, withHistory } from 'slate-vue';
import Toolbar from '../../components/Toolbar.vue';
import EditableVoid from './EditableVoid.vue';
import InsertEditableVoidButton from './InsertEditableVoidButton.vue';
import { h } from 'vue';

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.',
      },
    ],
  },
  {
    type: 'editable-void',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
]

const editor = withHistory(withDOM(createEditor(initialValue)))
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'editable-void':
      return h('div', {
        ref: attributes.ref,
        contentEditable: false,
      }, h(EditableVoid, () => children))
    default:
      return h('p', attributes, children)
  }
}
</script>