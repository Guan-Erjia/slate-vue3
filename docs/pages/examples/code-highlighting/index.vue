<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder" :decorate="decorate">
    <Toolbar>
      <Button data-testid="code-block-button" active @mousedown="onMouseDown">
        code
      </Button>
    </Toolbar>
    <Editable class="code-hightlighting" placeholder="Enter some text..." @keydown="onKeydown" />
  </Slate>
</template>
<script lang="ts" setup>
import "prismjs";
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'
import { Slate, Editable, RenderElementProps, defaultRenderPlaceHolder, RenderLeafProps, useInheritRef } from 'slate-vue3';
import { computed, h } from 'vue';
import LanguageSelect from './LanguageSelect.vue'
import Toolbar from '../../../components/Toolbar.vue';
import Button from '../../../components/Button.vue';
import isHotkey from "is-hotkey";
import { CodeBlockElement } from "../../../custom-types";
import { normalizeTokens } from '../../../utils/normalize-tokens'
import Prism from 'prismjs'
import { withHistory } from "slate-vue3/history";
import { DOMEditor, withDOM } from "slate-vue3/dom";
import { createEditor, Editor, Element, NodeEntry, Transforms, Node, Range } from "slate-vue3/core";

const toChildren = (content: string) => [{ text: content }]
const toCodeLines = (content: string): Element[] =>
  content
    .split('\n')
    .map(line => ({ type: 'code-line', children: toChildren(line) }))
const initialValue: Element[] = [
  {
    type: 'paragraph',
    children: toChildren(
      "Here's one containing a single paragraph block with some text in it:"
    ),
  },
  {
    type: 'code-block',
    language: 'jsx',
    children: toCodeLines(`// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

const App = () => {
  const [editor] = useState(() => withReact(createEditor()))

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable />
    </Slate>
  )
}`),
  },
  {
    type: 'paragraph',
    children: toChildren(
      'If you are using TypeScript, you will also need to extend the Editor with ReactEditor and add annotations as per the documentation on TypeScript. The example below also includes the custom types required for the rest of this example.'
    ),
  },
  {
    type: 'code-block',
    language: 'typescript',
    children: toCodeLines(`// TypeScript users only add this code
import { BaseEditor, Descendant } from 'slate'
import { DOMEditor } from 'slate-dom'

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & DOMEditor
    Element: CustomElement
    Text: CustomText
  }
}`),
  },
  {
    type: 'paragraph',
    children: toChildren('There you have it!'),
  },
]

const editor = withHistory(withDOM(createEditor(initialValue)))

const renderLeaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props
  const { text, ...rest } = leaf
  return h('span', { ...attributes, class: Object.keys(rest).join(' ') }, children)
}

const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  if (element.type === 'code-block') {
    const onChange = (e: Event) => {
      const path = DOMEditor.findPath(editor, element)
      Transforms.setNodes(editor, { language: (e.target as HTMLSelectElement).value }, { at: path })
    }
    return h(LanguageSelect, { value: element.language, onChange, ...useInheritRef(attributes) }, () => children)
  }

  if (element.type === 'code-line') {
    return h('div', { ...attributes, style: { position: 'relative' } }, children)
  }

  return h(editor.isInline(element) ? 'span' : 'div', { ...attributes, style: { position: 'relative' } }, children)
}

const onKeydown = (e: KeyboardEvent) => {
  if (isHotkey('tab', e)) {
    // handle tab key, insert spaces
    e.preventDefault()
    Editor.insertText(editor, '  ')
  }
}

const mergeMaps = <K, V>(...maps: Map<K, V>[]) => {
  const map = new Map<K, V>()
  for (const m of maps) {
    for (const item of m) {
      map.set(...item)
    }
  }
  return map
}

const getChildNodeToDecorations = ([
  block,
  blockPath,
]: NodeEntry<CodeBlockElement>) => {
  const nodeToDecorations = new Map<Element, Range[]>()
  const text = block.children.map(line => Node.string(line)).join('\n')
  const language = block.language
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

const blockEntries = computed(() => Array.from(
  Editor.nodes(editor, {
    at: [],
    mode: 'highest',
    match: n => Element.isElement(n) && n.type === 'code-block',
  })
))

const node2Decorations = computed(() => mergeMaps(
  ...blockEntries.value.map(getChildNodeToDecorations)
))

const decorate = computed(() => ([node, path]: any) => {
  if (Element.isElement(node) && node.type === 'code-line') {
    const ranges = node2Decorations.value.get(node) || []
    return ranges
  }
  return []
})

const ParagraphType = 'paragraph'
const CodeBlockType = 'code-block'
const CodeLineType = 'code-line'
const onMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  Transforms.wrapNodes(
    editor,
    { type: CodeBlockType, language: 'html', children: [] },
    {
      match: n => Element.isElement(n) && n.type === ParagraphType,
      split: true,
    }
  )
  Transforms.setNodes(
    editor,
    { type: CodeLineType as any },
    { match: n => Element.isElement(n) && n.type === ParagraphType }
  )
}
</script>
<style>
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