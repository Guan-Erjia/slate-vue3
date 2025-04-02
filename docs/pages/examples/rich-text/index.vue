<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, type RenderElementProps, type RenderLeafProps } from "slate-vue3"
import { CSSProperties, h } from "vue";
import Toolbar from '../../../components/Toolbar.vue'
import MarkButton from "./MarkButton.vue";
import BlockButton from "./BlockButton.vue";
import { CustomElement } from "../../../custom-types";
import { withHistory } from "slate-vue3/history";
import { withDOM } from "slate-vue3/dom";
import { createEditor } from "slate-vue3/core";

const initialValue: CustomElement[] = [
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

const renderElement = ({ attributes: attrs, children, element }: RenderElementProps) => {
  const attributes = {
    ...attrs, style: {
      ['text-align']: 'align' in element ? element.align || 'left' : '',
    }
  }
  switch (element.type) {
    case 'block-quote':
      return h('blockquote', attributes, children)

    case 'bulleted-list':
      return h('ul', attributes, children)

    case 'heading-one':
      return h('h1', attributes, children)

    case 'heading-two':
      return h('h2', attributes, children)

    case 'heading-three':
      return h('h3', attributes, children)

    case 'list-item':
      return h('li', attributes, children)

    case 'numbered-list':
      return h('ol', attributes, children)

    default:
      return h('p', attributes, children)
  }
}

const renderLeaf = ({ leaf, attributes, children, }: RenderLeafProps) => {
  const style: CSSProperties = {};
  if ('bold' in leaf) {
    style.fontWeight = "bold";
  }
  if ('italic' in leaf) {
    style.fontStyle = "italic";
  }
  if ('underline' in leaf) {
    style.borderBottom = "1px solid black";
  }
  if ('delete' in leaf) {
    style.textDecoration = "line-through";
  }
  return h(
    'code' in leaf ? "code" : 'bold' in leaf ? "strong" : "span",
    { ...attributes, style },
    children
  )
}

const editor = withHistory(withDOM(createEditor(initialValue))) 
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Toolbar>
      <MarkButton format="bold" icon="format_bold" />
      <MarkButton format="italic" icon="format_italic" />
      <MarkButton format="underline" icon="format_underlined" />
      <MarkButton format="code" icon="code" />
      <BlockButton format="heading-one" icon="looks_one" />
      <BlockButton format="heading-two" icon="looks_two" />
      <BlockButton format="block-quote" icon="format_quote" />
      <BlockButton format="numbered-list" icon="format_list_numbered" />
      <BlockButton format="bulleted-list" icon="format_list_bulleted" />
      <BlockButton format="left" icon="format_align_left" />
      <BlockButton format="center" icon="format_align_center" />
      <BlockButton format="right" icon="format_align_right" />
      <BlockButton format="justify" icon="format_align_justify" />
    </Toolbar>
    <Editable placeholder="Enter some rich text…" spellcheck />
  </Slate>
</template>
