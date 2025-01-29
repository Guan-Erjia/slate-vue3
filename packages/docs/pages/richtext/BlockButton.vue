<template>
  <Button :active="isBlockActive" @mousedown="onMouseDown">
    {{ props.icon }}
  </Button>
</template>

<script setup lang="ts">
import {
  Editor,
  Element,
  Transforms,
} from 'slate';
import { useEditor } from 'slate-vue'
import Button from '../../components/Button.vue';
import { computed } from 'vue';
import { CustomElement } from '../../custom-types';
const editor = useEditor()
const props = defineProps<{
  icon: string,
  format: string
}>()

const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']
const isBlockActive = computed(() => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        "align" in n && n[TEXT_ALIGN_TYPES.includes(props.format) ? 'align' : 'type'] === props.format,
    })
  )

  return !!match
})

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const onMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  const isActive = isBlockActive.value
  const isList = LIST_TYPES.includes(props.format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      Element.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(props.format),
    split: true,
  })
  let newProperties: Partial<Element>
  if (TEXT_ALIGN_TYPES.includes(props.format)) {
    newProperties = {
      align: isActive ? undefined : props.format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : props.format as CustomElement['type'],
    }
  }
  Transforms.setNodes<Element>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: props.format, children: [] } as CustomElement
    Transforms.wrapNodes(editor, block)
  }
}

</script>
