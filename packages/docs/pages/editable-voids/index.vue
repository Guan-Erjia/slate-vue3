<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Toolbar>
      <Button class="material-icons" @mousedown="onMouseDown">add</Button>
    </Toolbar>
    <Editable placeholder="Enter some text..." />
  </Slate>
</template>
<script lang="ts" setup>
import { createEditor, Descendant, withDOM, Slate, Editable, RenderElementProps, defaultRenderLeaf, defaultRenderPlaceHolder, withHistory, Transforms } from 'slate-vue';
import Toolbar from '../../components/Toolbar.vue';
import EditableVoid from './EditableVoid.vue';
import Button from '../../components/Button.vue';
import { EditableVoidElement } from '../../custom-types';
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
        ...attributes,
        contentEditable: false,
      }, h(EditableVoid, () => children))
    default:
      return h('p', attributes, children)
  }
}

const onMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  const text = { text: '' }
  const voidNode: EditableVoidElement = {
    type: 'editable-void',
    children: [text],
  }
  Transforms.insertNodes(editor, voidNode)
}
</script>