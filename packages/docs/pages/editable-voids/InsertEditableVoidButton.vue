<template>
  <Button @mousedown="onMouseDown">add</Button>
</template>

<script lang="ts" setup>
import Button from '../../components/Button.vue';
import { EditableVoidElement } from 'packages/docs/custom-types';
import { Transforms, useEditor } from 'slate-vue';
const editor = useEditor()
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