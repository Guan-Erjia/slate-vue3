<template>
  <div :contentEditable="false">
    <div style="padding: 75% 0 0 0;
            position: relative">
      <iframe :src="`${safeUrl}?title=0&byline=0&portrait=0`" frameBorder="0" style="position: absolute; top: 0
          ;left: 0; width: 100%; height: 100%; border: none;" />
    </div>
    <input style="margin-top: 5px; box-sizing: border-box;" v-model="value" @change="onChange" />
  </div>
</template>
<script lang="ts" setup>
import { DOMEditor, useEditor, Element, Transforms } from 'slate-vue'
import { computed, ref } from 'vue';
const allowedSchemes = ['http:', 'https:']

const value = ref('')
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

const onChange = () => {
  const path = DOMEditor.findPath(editor, props.element)
  const newProperties: Partial<Element> = {
    url: value.value,
  }
  Transforms.setNodes<Element>(editor, newProperties, {
    at: path,
  })
}
</script>