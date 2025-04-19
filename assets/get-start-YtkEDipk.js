import{_ as e}from"./Markdown.vue_vue_type_style_index_0_lang-DFZeEyf6.js";import{d as n,f as t,e as a,o as r}from"./index-CyTzHxZd.js";import"./editable-BlWIE7mQ.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-D-OR_FHX.js";import"./normalize-tokens-Bcdb6Sh1.js";const i=`# introduction

\`slate-vue3\` is a rich text rendering engine based on slate implementation

Based on \`slate\` excellent design, \`slate-vue3\` can also meet high customization requirements in projects:

1. ✍️ [markdown-shortcuts](/slate-vue3/examples/markdown-shortcuts)
2. 🔨 [code-highlighting](/slate-vue3/examples/code-highlighting)
3. 🚀 [collaborative-editing](/slate-vue3/examples/remote-simple)
4. ......

## install

\`\`\`bash
npm install slate-vue3
\`\`\`

## minimal example

\`\`\`html
<script setup lang="ts">
import { h } from "vue";
import {
  Slate,
  Editable,
  defaultRenderLeaf,
  defaultRenderPlaceHolder,
} from "slate-vue3";
import { createEditor } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue = [{
  type: "paragraph",
  children: [{ text: "Let's start" }],
}];

const renderElement = ({ attributes, children }) =>
  h("p", attributes, children);
const editor = withHistory(withDOM(createEditor()));
editor.children = initialValue;

<\/script>

<template>
  <Slate
    :editor="editor"
    :render-element="renderElement"
    :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder"
  >
    <Editable />
  </Slate>
</template>
\`\`\`

## why you should need it

#### If you want to use [\`slate\`](https://docs.slatejs.org) in a [\`vue\`](https://vuejs.org) project, the process can be quite cumbersome, you need to do the following things:

1. install \`react.js\`
2. configuring jsx compilation ( if you don't want to use \`createElement\` api)
3. establish a message channel between \`slate-react\` and existing projects

#### However, doing these things does not bring a better development experience

- \`react.js\` will result in additional package size
- maintaining two front-end frameworks is also difficult
- it is even more impossible to integrate \`vue\` logic at rendering granularity

#### So, what other reasons are needed? just directly install \`slate-vue3\` and start your cool development journey

[click and see more example](/slate-vue3/examples/rich-text)

⠀⠀⠀⠀⠰⢷⢿⠄
⠀⠀⠀⠀⠀⣼⣷⣄
⠀⠀⣤⣿⣇⣿⣿⣧⣿⡄
⢴⠾⠋⠀⠀⠻⣿⣷⣿⣿⡀
🏀 ⠀⢀⣿⣿⡿⢿⠈⣿
⠀⠀⠀⢠⣿⡿⠁⠀⡊⠀⠙
⠀⠀⠀⢿⣿⠀⠀⠹⣿
⠀⠀⠀⠀⠹⣷⡀⠀⣿⡄
⠀⠀⠀⠀⣀⣼⣿⠀⢈⣧
`,g=n({__name:"get-start",setup(o){return(s,l)=>(r(),t(e,{content:a(i)},null,8,["content"]))}});export{g as default};
