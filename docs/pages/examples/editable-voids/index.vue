<template>
  <Slate :editor="editor" :render-element="renderElement">
    <Toolbar>
      <Button @click="onClick" @pointerdown="onPointerDown">add</Button>
    </Toolbar>
    <Editable placeholder="Enter some text..." />
  </Slate>
</template>
<script lang="ts" setup>
import { Slate, Editable, RenderElementProps, useInheritRef } from 'slate-vue3';
import Toolbar from '../../../components/Toolbar.vue';
import EditableVoid from './EditableVoid.vue';
import Button from '../../../components/Button.vue';
import { EditableVoidElement } from '../../../custom-types';
import { h } from 'vue';
import { createEditor, Descendant, Transforms } from 'slate-vue3/core';
import { withHistory } from 'slate-vue3/history';
import { withDOM } from 'slate-vue3/dom';

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

const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'editable-void':
      return h(EditableVoid, useInheritRef(attributes), () => children)
    default:
      return h('p', attributes, children)
  }
}

const onClick = () => {
  const text = { text: '' }
  const voidNode: EditableVoidElement = {
    type: 'editable-void',
    children: [text],
  }
  Transforms.insertNodes(editor, voidNode)
}
const onPointerDown = (event: PointerEvent) => {
  event.preventDefault()
}
</script>