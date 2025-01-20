<template>
  <Button :active="isMarkActive" @mousedown="onMouseDown">
    <Icon>{{ props.icon }}</Icon>
  </Button>
</template>

<script setup lang="ts">
import { Editor } from 'slate';
import { useEditor } from '../../../hooks/use-editor'
import Icon from '../../components/Icon.vue';
import Button from '../../components/Button.vue';
import { computed } from 'vue';
const editor = useEditor()
const props = defineProps<{
  icon: string,
  format: string
}>()

const isMarkActive = computed(() => {
  const marks = Editor.marks(editor)
  return marks ? marks[props.format] === true : false
})

const onMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  if (isMarkActive.value) {
    Editor.removeMark(editor, props.format)
  } else {
    Editor.addMark(editor, props.format, true)
  }
}
</script>