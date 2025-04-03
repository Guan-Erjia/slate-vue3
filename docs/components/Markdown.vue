<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder" :decorate="decorate">
    <Editable class="slate-markdown" :read-only="true" placeholder="Write some markdown..." spellcheck />
  </Slate>
</template>
<script lang="ts" setup>
import { Slate, Editable, RenderElementProps, defaultRenderPlaceHolder, RenderLeafProps, } from 'slate-vue3';
import { computed, CSSProperties, h, } from 'vue';
import "prismjs";
import 'prismjs/components/prism-markdown'
import { createEditor, Editor, Element, NodeEntry, Node, Range } from 'slate-vue3/core';
import { withHistory } from 'slate-vue3/history';
import { withDOM } from 'slate-vue3/dom';
import remarkGfm from "remark-gfm";
import { remarkToSlate, } from "remark-slate-transformer";
import remarkParse from "remark-parse";
import { unified } from "unified";
import 'prismjs/components/prism-typescript'
import Prism from 'prismjs'
import { CodeElement } from '../custom-types';
import { normalizeTokens } from '../utils/normalize-tokens'
import { map } from 'lodash-es';

const props = defineProps<{
  content: string;
}>()

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkToSlate)

const slateDescendant = processor.processSync(props.content).result;

const toChildren = (content: string) => [{ text: content }]
const toCodeLines = (content: string): Element[] =>
  content
    .split('\n')
    .map(line => ({ type: 'code-line', children: toChildren(line) }))

slateDescendant.filter(i => i.type === 'code').forEach(code => {
  code.children = toCodeLines(code.children[0].text)
})

const editor = withHistory(withDOM(createEditor(slateDescendant)))
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch ((element as any).type) {
    case 'heading':
      return h('h' + element.depth, attributes, children);
    case 'code':
      return h('pre', attributes, children)
    case 'list':
      return h(element.ordered ? 'ol' : 'ul', attributes, children)
    case 'listItem':
      return h('li', attributes, children)
    case 'link':
      return h('a', { href: (element as any).url, target: '_blank' }, children)
    default:
      return h('p', attributes, children);
  }
}

const renderLeaf = ({ text, attributes, children, leaf }: RenderLeafProps) => {
  const style: CSSProperties = {}
  if (text.strong) {
    style.fontWeight = 'bold'
  }
  if (text.emphasis) {
    style.fontStyle = 'italic'
  }
  if (text.inlineCode) {
    style.backgroundColor = 'rgb(246, 247, 250)'
    style.border = '1px solid rgb(229, 231, 235'
    style.borderRadius = '4px'
  }
  const { text: _text, ...rest } = leaf
  return h("span", { ...attributes, style, class: Object.keys(rest).join(' ') }, children)
}

const getChildNodeToDecorations = ([
  block,
  blockPath,
]: NodeEntry<CodeElement>) => {
  const nodeToDecorations = new Map<Element, Range[]>()
  const text = block.children.map(line => Node.string(line)).join('\n')
  const language = block.lang
  const tokens = Prism.tokenize(text, Prism.languages[language])
  const normalizedTokens = normalizeTokens(tokens) // make tokens flat and grouped by line
  const blockChildren = block.children as Element[]

  for (let index = 0; index < normalizedTokens.length; index++) {
    const tokens = normalizedTokens[index]
    const element = blockChildren[index]

    if (!nodeToDecorations.has(element)) {
      nodeToDecorations.set(element, [])
    }

    let start = 0
    for (const token of tokens) {
      const length = token.content.length
      if (!length) {
        continue
      }

      const end = start + length

      const path = [...blockPath, index, 0]
      const range: Range = {
        anchor: { path, offset: start },
        focus: { path, offset: end },
        token: true,
        ...Object.fromEntries(token.types.map(type => [type, true])),
      }

      nodeToDecorations.get(element)!.push(range)

      start = end
    }
  }

  return nodeToDecorations
}

const blockEntries = Array.from(
  Editor.nodes(editor, {
    at: [],
    mode: 'highest',
    match: n => Element.isElement(n) && n.type === 'code',
  })
)

const node2Decorations = new Map()
for (const m of blockEntries.map(getChildNodeToDecorations)) {
  for (const item of m) {
    node2Decorations.set(...item)
  }
}

const decorate = ([node]: any) => {
  if (Element.isElement(node) && node.type === 'code-line') {
    const ranges = node2Decorations.get(node) || []
    return ranges
  }
  return []
}
</script>
<style>
.slate-markdown {
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans
}

.slate-markdown a {
  color: rgb(3, 102, 214);
  text-decoration: underline;
}

.slate-markdown a:hover {
  color: black;
}

.slate-markdown ul {
  padding-inline-start: 25px;
}

.slate-markdown ol {
  padding-inline-start: 25px;
}

.slate-markdown li {
  margin-bottom: 8px;
}

.slate-markdown h1 {
  margin-top: 10px;
  margin-bottom: 16px;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(209, 217, 224, 0.7);
}

.slate-markdown h2 {
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(209, 217, 224, 0.7);
}

.slate-markdown pre {
  display: block;
  background-color: rgb(246, 248, 250);
  font-family: Consolas;
}

code[class*="language-"],
pre[class*="language-"] {
  color: black;
  background: none;
  text-shadow: 0 1px white;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  font-size: 1em;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}

pre[class*="language-"]::-moz-selection,
pre[class*="language-"] ::-moz-selection,
code[class*="language-"]::-moz-selection,
code[class*="language-"] ::-moz-selection {
  text-shadow: none;
  background: #b3d4fc;
}

pre[class*="language-"]::selection,
pre[class*="language-"] ::selection,
code[class*="language-"]::selection,
code[class*="language-"] ::selection {
  text-shadow: none;
  background: #b3d4fc;
}

@media print {

  code[class*="language-"],
  pre[class*="language-"] {
    text-shadow: none;
  }
}

/* Code blocks */
pre[class*="language-"] {
  padding: 1em;
  margin: .5em 0;
  overflow: auto;
}

:not(pre)>code[class*="language-"],
pre[class*="language-"] {
  background: #f5f2f0;
}

/* Inline code */
:not(pre)>code[class*="language-"] {
  padding: .1em;
  border-radius: .3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: slategray;
}

.token.punctuation {
  color: #999;
}

.token.namespace {
  opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
  color: #905;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #690;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #9a6e3a;
  /* This background color was intended by the author of this theme. */
  background: hsla(0, 0%, 100%, .5);
}

.token.atrule,
.token.attr-value,
.token.keyword {
  color: #07a;
}

.token.function,
.token.class-name {
  color: #DD4A68;
}

.token.regex,
.token.important,
.token.variable {
  color: #e90;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
</style>