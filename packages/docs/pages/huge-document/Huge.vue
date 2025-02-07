<script setup lang="ts">
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withDOM, withHistory } from "slate-vue"
import { h } from "vue";
import type { Descendant, RenderElementProps, } from "slate-vue";
import { faker } from '@faker-js/faker'

const props = defineProps<{
  short?: boolean
}>()
const HEADINGS = props.short ? 5 : 100
const PARAGRAPHS = props.short ? 3 : 7
const initialValue: Descendant[] = []

for (let h = 0; h < HEADINGS; h++) {
  initialValue.push({
    type: 'heading-one',
    children: [{ text: faker.lorem.sentence() }],
  })

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValue.push({
      type: 'paragraph',
      children: [{ text: faker.lorem.paragraph() }],
    })
  }
}

const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'heading-one':
      return h('h1', attributes, children)
    default:
      return h('p', attributes, children)
  }
}
const editor = withHistory(withDOM(createEditor(initialValue))) 
</script>
<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable :style="{ height: (props.short ? '150px' : '500px'), overflowY: 'scroll' }" placeholder="Enter a title…"
      spellCheck />
  </Slate>
</template>
