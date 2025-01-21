<script setup lang="ts">
import { Slate, Editable } from "slate-vue"
import { h } from "vue";
import { IS_ANDROID, withDOM } from "slate-dom";
import type { RenderElementProps, RenderLeafProps, RenderPlaceholderProps } from "slate-vue";
import { createEditor, Descendant } from "slate";
import Toolbar from '../../components/Toolbar.vue'
import MarkButton from "./MarkButton.vue";
import BlockButton from "./BlockButton.vue";

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
    <Toolbar>
      <MarkButton format="bold" icon="format_bold" />
      <!-- <MarkButton format="italic" icon="format_italic" />
      <MarkButton format="underline" icon="format_underlined" />
      <MarkButton format="code" icon="code" /> -->
      <!-- <BlockButton format="heading-one" icon="looks_one" />
      <BlockButton format="heading-two" icon="looks_two" />
      <BlockButton format="block-quote" icon="format_quote" />
      <BlockButton format="numbered-list" icon="format_list_numbered" />
      <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      <BlockButton format="left" icon="format_align_left" />
      <BlockButton format="center" icon="format_align_center" />
      <BlockButton format="right" icon="format_align_right" />
      <BlockButton format="justify" icon="format_align_justify" /> -->
    </Toolbar>
    <Editable style="border: 1px solid red;padding: 10px;" placeholder="Enter some rich text…" spellCheck autoFocus
      :render-element="renderElement" :render-leaf="renderLeaf" :render-placeholder="renderPlaceHolder" />
  </Slate>
</template>
