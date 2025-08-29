<template>
  <Button :active="isBlockActive" @click="onClick" @pointerdown="onPointerDown">
    {{ props.icon }}
  </Button>
</template>

<script setup lang="ts">
import {
  Editor,
  Element,
  Transforms,
} from 'slate-vue3/core';
import { useEditor } from 'slate-vue3'
import Button from '../../../components/Button.vue';
import { computed } from 'vue';
import { CustomElement } from '../../../custom-types';
const editor = useEditor()
const props = defineProps<{
  icon: string,
  format: string
}>()

const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']
const isBlockActive = computed(() => {
  if (!editor.selection) return false
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, editor.selection),
      match: n => {
        const align = TEXT_ALIGN_TYPES.includes(props.format) ? 'align' : 'type'
        return !Editor.isEditor(n) &&
          Element.isElement(n) &&
          // @ts-ignore
          n[align] === props.format
      }
    })
  )

  return !!match
})

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const onClick = () => {
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
  let newProperties: Partial<CustomElement>
  if (TEXT_ALIGN_TYPES.includes(props.format)) {
    newProperties = {
      align: isActive ? undefined : props.format,
    }
  } else {
    // @ts-ignore
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
const onPointerDown = (event: PointerEvent) => {
  event.preventDefault()
}
</script>
