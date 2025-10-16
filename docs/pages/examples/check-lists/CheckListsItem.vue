<template>
  <div style="display: flex; flex-direction: row; align-items: center">
    <span :contenteditable="false" style="margin-right:12px;">
      <input type="checkbox" :checked @change="onChange" />
    </span>
    <span :contenteditable="!readOnly" style="flex: 1" :style="{
      opacity: checked ? 0.666 : 1,
      textDecoration: !checked ? 'none' : 'line-through'
    }">
      <slot />
    </span>
  </div>
</template>

<script lang="ts" setup>
import { useEditor, useReadOnly } from 'slate-vue3';
import { computed, Events, } from 'vue';
import { CheckListItemElement, CustomElement } from '../../../custom-types';
import { DOMEditor } from 'slate-vue3/dom';
import { Transforms } from 'slate-vue3/core';
const props = defineProps<{
  element: CheckListItemElement
}>()
const editor = useEditor()
const readOnly = useReadOnly()
const checked = computed<boolean>(() => props.element.checked)

const onChange = (event: Events['onChange']) => {
  const path = DOMEditor.findPath(editor, props.element)
  const newProperties: Partial<CustomElement> = {
    checked: (event.target as HTMLInputElement).checked,
  }
  Transforms.setNodes(editor, newProperties, { at: path })
}
</script>
