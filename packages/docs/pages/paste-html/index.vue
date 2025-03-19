<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, } from "slate-vue3"
import type { RenderElementProps, RenderLeafProps } from "slate-vue3";
import { jsx } from 'slate-vue3/hyperscript'
import { h } from "vue";
import ImageElement from "./ImageElement.vue";
import { withDOM } from "slate-vue3/dom";
import { createEditor, Descendant, Transforms } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";
import { CustomEditor } from "../../custom-types";

const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:']
const ELEMENT_TAGS = {
  A: (el: HTMLLinkElement) => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'block' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: (el: HTMLImageElement) => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  UL: () => ({ type: 'bulleted-list' }),
}

const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
}

const deserialize = (el: any): any => {
  if (el.nodeType === 3) {
    return el.textContent
  } else if (el.nodeType !== 1) {
    return null
  } else if (el.nodeName === 'BR') {
    return '\n'
  }

  const nodeName: string = el.nodeName
  let parent = el

  if (
    nodeName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0]
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat()

  if (children.length === 0) {
    children = [{ text: '' }]
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children)
  }

  if (nodeName in ELEMENT_TAGS) {
    const attrs = ELEMENT_TAGS[nodeName as keyof typeof ELEMENT_TAGS](el)
    return jsx('element', attrs, children)
  }

  if (nodeName in TEXT_TAGS) {
    const attrs = TEXT_TAGS[nodeName as keyof typeof TEXT_TAGS]()
    return children.map(child => jsx('text', attrs, child))
  }

  return children
}
const withHtml = (editor: CustomEditor) => {
  const { insertData, isInline, isVoid } = editor

  editor.isInline = element => element.type === 'link' ? true : isInline(element)

  editor.isVoid = element => element.type === 'image' ? true : isVoid(element)

  editor.insertData = data => {
    const html = data.getData('text/html')

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      const fragment = deserialize(parsed.body)
      Transforms.insertFragment(editor, fragment)
      return
    }
    insertData(data)
  }

  return editor
}


const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: "By default, pasting content into a Slate editor will use the clipboard's ",
      },
      { text: "'text/plain'", code: true },
      {
        text: " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintain its formatting. To do this, your editor needs to handle ",
      },
      { text: "'text/html'", code: true },
      { text: ' data. ' },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'This is an example of doing exactly that!' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Try it out for yourself! Copy and paste some rendered HTML rich text content (not the source code) from another site into this editor and it's formatting should be preserved.",
      },
    ],
  }
]

const renderElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  switch (element.type) {
    default:
      return h('p', attributes, children)
    case 'block':
      return h('blockquote', attributes, children)
    case 'code':
      return h('pre', null, h('code', attributes, children))
    case 'bulleted-list':
      return h('ul', attributes, children)
    case 'heading-one':
      return h('h1', attributes, children)
    case 'heading-two':
      return h('h2', attributes, children)
    case 'heading-three':
      return h('h3', attributes, children)
    case 'heading-four':
      return h('h4', attributes, children)
    case 'heading-five':
      return h('h5', attributes, children)
    case 'heading-six':
      return h('h6', attributes, children)
    case 'list-item':
      return h('li', attributes, children)
    case 'numbered-list':
      return h('ol', attributes, children)
    case 'link':
      return h('a', { ...attributes, href: allowedSchemes.includes(element.url) ? element.url : 'about:blank' }, children)
    case 'image':
      return h('div', attributes, h(ImageElement, { element }, children))
  }
}

const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props
  if ('bold' in leaf) {
    return h('strong', attributes, children)
  }
  if ('code' in leaf) {
    return h('code', attributes, children)
  }
  if ('italic' in leaf) {
    return h('em', attributes, children)
  }
  if ('underline' in leaf) {
    return h('u', attributes, children)
  }
  return h('span', attributes, children)
}

const editor = withHistory(withHtml(withDOM(createEditor(initialValue)))) 
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable placeholder="Paste in some HTML..." spellcheck />
  </Slate>
</template>
