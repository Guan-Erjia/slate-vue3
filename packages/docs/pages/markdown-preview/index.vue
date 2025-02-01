<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder" :decorate="decorate">
    <Editable placeholder="Enter some text..." />
  </Slate>
</template>
<script lang="ts" setup>
import { createEditor, Descendant, withDOM, Slate, Editable, RenderElementProps, defaultRenderLeaf, defaultRenderPlaceHolder, DecoratedRange, NodeEntry, Text, RenderLeafProps } from 'slate-vue';
import { CSSProperties, h } from 'vue';
import Prism from 'prismjs'
import 'prismjs/components/prism-markdown'

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: '## Try it out!' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

const decorate = ([node, path]: NodeEntry): DecoratedRange[] => {
  const ranges: any[] = []

  if (!Text.isText(node)) {
    return ranges
  }

  const getLength = (token: any) => {
    if (typeof token === 'string') {
      return token.length
    } else if (typeof token.content === 'string') {
      return token.content.length
    } else {
      return token.content.reduce((l: any, t: any) => l + getLength(t), 0)
    }
  }

  const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
  let start = 0

  for (const token of tokens) {
    const length = getLength(token)
    const end = start + length

    if (typeof token !== 'string') {
      ranges.push({
        [token.type]: true,
        anchor: { path, offset: start },
        focus: { path, offset: end },
      })
    }

    start = end
  }

  return ranges
}


const editor = withDOM(createEditor(initialValue))
const renderElement = ({ attributes, children }: RenderElementProps) => {
  return h('p', attributes, children)
}

const renderLeaf = (props: RenderLeafProps & {
  leaf: any
}) => {
  const { attributes, children, leaf } = props
  const style: CSSProperties = {
    fontWeight: leaf.bold ? 'bold' : '',
    fontStyle: leaf.italic ? 'italic' : '',
    textDecoration: leaf.underlined ? 'underline' : ''
  }
  if (leaf.title) {
    style.display = 'inline-block'
    style.fontWeight = 'bold'
    style.fontSize = '20px'
    style.margin = '20px 0 10px 0'
  }
  if (leaf.list) {
    style.paddingLeft = '10px'
    style.fontSize = '20px'
    style.lineHeight = '10px'
  }
  if (leaf.hr) {
    style.display = 'block'
    style.textAlign = 'center'
    style.borderBottom = '2px solid #ddd'
  }
  if (leaf.blockquote) {
    style.display = 'inline-block'
    style.borderLeft = '2px solid #ddd'
    style.paddingLeft = '10px'
    style.color = '#aaa'
    style.fontStyle = 'italic'
  }
  if (leaf.code) {
    style.fontFamily = 'monospace'
    style.backgroundColor = '#eee'
    style.padding = '3px'
  }

  return h('span', { ...attributes, style }, children)
}  
</script>