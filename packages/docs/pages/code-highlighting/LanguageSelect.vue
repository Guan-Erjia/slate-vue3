<template>
  <select data-test-id="language-select" :value="props.value" :contentEditable="false" style="position: absolute; right: 5px; top:
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
</template>
<script lang="ts" setup>
const props = defineProps<{
  value: string
}>()
const emit = defineEmits(['onChange']);
const onChange = (e: Event) => {
  emit('onChange', e)
}
</script>