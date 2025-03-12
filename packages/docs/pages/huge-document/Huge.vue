<script setup lang="ts">
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, type RenderElementProps } from "slate-vue3"
import { h } from "vue";
import { faker } from '@faker-js/faker'
import { createEditor, Descendant } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";
import { withDOM } from "slate-vue3/dom";

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
