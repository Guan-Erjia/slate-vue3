<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable class="slate-markdown" :read-only="true" placeholder="Write some markdown..." spellcheck />
  </Slate>
</template>
<script lang="ts" setup>
import { Slate, Editable, RenderElementProps, defaultRenderPlaceHolder, defaultRenderLeaf, RenderLeafProps, } from 'slate-vue3';
import { CSSProperties, h, toRaw } from 'vue';
import "prismjs";
import 'prismjs/components/prism-markdown'
import { createEditor } from 'slate-vue3/core';
import { withHistory } from 'slate-vue3/history';
import { withDOM } from 'slate-vue3/dom';
import remarkGfm from "remark-gfm";
import { remarkToSlate, } from "remark-slate-transformer";
import remarkParse from "remark-parse";
import { unified } from "unified";

const props = defineProps<{
  content: string;
}>()

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkToSlate)
const slateDescendant = processor.processSync(props.content).result;

const editor = withHistory(withDOM(createEditor(slateDescendant)))
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch ((element as any).type) {
    case 'heading':
      return h('h' + element.depth, attributes, children);
    case 'code':
      return h('code', attributes, children)
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

const renderLeaf = ({ text, attributes, children, }: RenderLeafProps) => {
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
  return h("span", { ...attributes, style, }, children)
}
</script>
<style>
.slate-markdown {
  font-family: system-ui;
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
  margin-top: 8px;
}

.slate-markdown h2 {
  margin: 20px 0;
}
</style>