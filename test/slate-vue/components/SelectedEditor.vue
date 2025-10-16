<template>
  <Slate :editor :render-element="props.renderElement">
    <Editable />
  </Slate>
</template>
<script lang="ts" setup>
import { DOMEditor } from 'slate-dom';
import { Slate, Editable, RenderElementProps } from 'slate-vue'
import { VNode } from 'vue';

const props = defineProps<{
  editor: DOMEditor
  renderElement: (props: RenderElementProps) => VNode
}>()
</script>