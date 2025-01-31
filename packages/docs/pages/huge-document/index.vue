<script setup lang="ts">
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withDOM } from "slate-vue"
import { h, ref } from "vue";
import type { Descendant, RenderElementProps, } from "slate-vue";
import { faker } from '@faker-js/faker'

const HEADINGS = 100
const PARAGRAPHS = 7
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
const editor = withDOM(createEditor(initialValue))
const isFold = ref(true)
</script>
<template>
  <a style="position: absolute; top: -35px; right: 80px; cursor: pointer;" @click="isFold = !isFold">
    {{ isFold ? '展开' : '收起' }}
  </a>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable :style="isFold ? { height: '300px', overflowY: 'scroll' } : {}" placeholder="Enter a title…" spellCheck
      autoFocus />
  </Slate>
</template>
<style scoped>
a {
  color: gray;
  text-decoration: none
}

a:hover {
  color: #aaaaaa;
}
</style>
