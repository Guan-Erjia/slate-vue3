<script setup lang="ts">
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, type RenderElementProps, } from "slate-vue3"
import { h } from "vue";
import { faker } from '@faker-js/faker'
import { createEditor, Descendant } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

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
const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue;
</script>
<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Enter a title…" spellcheck />
  </Slate>
</template>
