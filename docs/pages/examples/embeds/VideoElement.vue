<template>
  <div :contenteditable="false" v-bind="attrs">
    <iframe :src="`${safeUrl}?title=0&byline=0&portrait=0`" frameBorder="0"
      style="border: none; width: 100%;height: 400px;" />
    <input type="text" style="margin-top: 5px; box-sizing: border-box;" :value="element.url" @change="onChange" />
  </div>
</template>
<script lang="ts" setup>
import { useEditor } from 'slate-vue3'
import { Element, Transforms } from 'slate-vue3/core'
import { DOMEditor } from 'slate-vue3/dom'
import { computed, HTMLAttributes, ref, useAttrs } from 'vue';
const allowedSchemes = ['http:', 'https:']

const editor = useEditor()
const props = defineProps<{
  element: any;
}>()
const safeUrl = computed(() => {
  let parsedUrl: URL | null = null
  try {
    parsedUrl = new URL(props.element.url)
  } catch { }
  if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
    return parsedUrl.href
  }
  return 'about:blank'
})

const onChange = (e: Event) => {
  const path = DOMEditor.findPath(editor, props.element)
  const newProperties: Partial<Element> = {
    url: (e.target as HTMLInputElement).value,
  }
  Transforms.setNodes<Element>(editor, newProperties, {
    at: path,
  })
}
const attrs: HTMLAttributes = useAttrs()
</script>