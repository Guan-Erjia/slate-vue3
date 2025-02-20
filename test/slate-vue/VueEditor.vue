<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder" @change="onChange" @selectionchange="onSelectionChange"
    @valuechange="onValueChange">
    <Editable />
  </Slate>
</template>
<script lang="ts" setup>
import { Slate, Editable, RenderElementProps, defaultRenderLeaf, defaultRenderPlaceHolder, DOMEditor } from 'slate-vue'
import { h } from 'vue';

const props = defineProps<{
  editor: DOMEditor
  onValueChange?: (value: any) => void
  onChange?: (value: any) => void
  onSelectionChange?: (value: any) => void
  onRenderTracked?: () => void
}>()

const renderElement = ({ attributes, children, }: RenderElementProps) => {
  props.onRenderTracked?.()
  return h('p', attributes, children)
}
</script>