<template>
  <code v-bind="attrs" style="font-size: 16px;line-height: 20px;margin-top: 0;
    background-color: rgba(0,20,60,.03);padding: 5px 13px;position: relative;display: block;" :spellcheck="false">
    <select data-testid="language-select" :value="props.value" :contenteditable="false" style="position: absolute; right: 5px; top:
    5px; z-index: 1;" @change="onChange">
      <option value="css">CSS</option>
      <option value="html">HTML</option>
      <option value="java">Java</option>
      <option value="javascript">JavaScript</option>
      <option value="jsx">JSX</option>
      <option value="markdown">Markdown</option>
      <option value="php">PHP</option>
      <option value="python">Python</option>
      <option value="sql">SQL</option>
      <option value="tsx">TSX</option>
      <option value="typescript">TypeScript</option>
    </select>
    <slot />
  </code>
</template>
<script lang="ts" setup>
import { HTMLAttributes, useAttrs } from 'vue';
const props = defineProps<{
  value: string
}>()
const emit = defineEmits(['onChange']);
const onChange = (e: Event) => {
  emit('onChange', e)
}
const attrs: HTMLAttributes = useAttrs()
</script>