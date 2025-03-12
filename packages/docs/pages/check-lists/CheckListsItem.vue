<template>
  <div style="display: flex; flex-direction: row; align-items: center">
    <span :contentEditable="false" style="margin-right:12px;">
      <input type="checkbox" :checked="checked" @change="onChange" />
    </span>
    <span :contentEditable="!readOnly" suppressContentEditableWarning style="flex: 1" :style="{
      opacity: checked ? 0.666 : 1,
      textDecoration: !checked ? 'none' : 'line-through'
    }">
      <slot></slot>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { useEditor, useReadOnly } from 'slate-vue3';
import { computed, Events, } from 'vue';
import { CustomElement } from '../../custom-types';
import { DOMEditor } from 'slate-vue3/dom';
import { Transforms } from 'slate-vue3/core';
const props = defineProps<{
  element: any
}>()
const editor = useEditor()
const readOnly = useReadOnly()
const checked = computed<boolean>(() => props.element?.checked)

const onChange = (event: Events['onChange']) => {
  const path = DOMEditor.findPath(editor, props.element)
  const newProperties: Partial<CustomElement> = {
    checked: (event.target as HTMLInputElement)?.checked,
  }
  Transforms.setNodes(editor, newProperties, { at: path })
}
</script>
