import{L as e,S as t,o as n,p as r}from"./runtime-core.esm-bundler-ebiS_r9Z.js";import{t as i}from"./Markdown-Ckf5t3Y6.js";var a=`# introduction

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
import { Slate, Editable, } from "slate-vue3";
import { createEditor } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue = [{
  type: "paragraph",
  children: [{ text: "Let's start" }],
}];

const editor = withHistory(withDOM(createEditor()));
editor.children = initialValue;
<\/script>

<template>
  <Slate :editor>
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

[click and see more example](/slate-vue3/examples/rich-text)`,o=r({__name:`get-start`,setup(r){return(r,o)=>(t(),n(i,{content:e(a)},null,8,[`content`]))}});export{o as default};