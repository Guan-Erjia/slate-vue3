<script setup lang="ts">
import { Slate } from "../index"
import { Editable } from "../index"
import { h } from "vue";
import { IS_ANDROID, withDOM } from "slate-dom";
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from "../components/interface";
import { createEditor, Descendant } from "slate";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text: ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]


const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch (element.type) {
    case 'block-quote':
      return h('blockquote', attributes, children)

    case 'bulleted-list':
      return h('ul', attributes, children)

    case 'heading-one':
      return h('h1', attributes, children)

    case 'heading-two':
      return h('h2', attributes, children)

    case 'list-item':
      return h('li', attributes, children)

    case 'numbered-list':
      return h('ol', attributes, children)

    default:
      return h('ol', attributes, children)
  }
}

const renderLeaf = ({ leaf, attributes, children, }: RenderLeafProps) => {
  if (leaf.bold) {
    return h('strong', attributes, children)
  }

  if (leaf.code) {
    return h('code', attributes, children)
  }

  if (leaf.italic) {
    return h('em', attributes, children)
  }

  if (leaf.underline) {
    return h('u', attributes, children)
  }

  return h('span', attributes, children)
}

const renderPlaceHolder = ({ attributes, children }: RenderPlaceholderProps) => {
  return h('span', attributes, [
    children,
    IS_ANDROID ? h('br') : undefined
  ])
}

const editor = withDOM(createEditor(initialValue))
</script>

<template>
  <Slate :editor="editor">
    <Editable style="border: 1px solid red;padding: 10px;" placeholder="Enter some rich text…" spellCheck autoFocus
      :render-element="renderElement" :render-leaf="renderLeaf" :render-placeholder="renderPlaceHolder" />
  </Slate>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
