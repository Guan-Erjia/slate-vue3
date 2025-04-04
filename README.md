[<img src="https://github.com/Guan-Erjia/slate-vue3/blob/master/public/banner.png" />](https://github.com/ianstormtaylor/slate)

<p align="center">
  slate-<a style="color: #087ea4" href="https://react.dev/">react</a> library implemented with <a style="color: #42b883" href="https://vuejs.org/">vue3</a>
</p>

<p align="center">
  <a href="https://unpkg.com/slate-vue3/dist/index.js">
    <img src="http://img.badgesize.io/https://unpkg.com/slate-vue3/dist/index.js?compression=gzip&amp;label=size">
  </a>
  <a href="https://join.slack.com/t/slate-js/shared_invite/zt-f8t986ip-7dA1DyiqPpzootz1snKXkw">
    <img src="https://img.shields.io/badge/slack-slate--js-brightgreen.svg?logo=slack">
  </a>
  <a href="./packages/slate-vue3/package.json">
    <img src="https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=version&colorB=007ec6">
  </a>
</p>
<br/>

# Why use it?

1. :sparkles: Highly customizable features, use slate core at the bottom level
2. :zap: The latest version of the core, use vue to reduce the number of re-renderings
3. :coffee: This library provides the same usage as slate-react, design tends to be stable
4. :point_right: Check out the [**live demo**](https://guan-erjia.github.io/slate-vue3/) of all of the examples

# How to use?

## 1. Install slate-vue3

```sh
npm install slate-vue3
```

## 2. Now, you can use it in vue-sfc :point_right: [**live demo**](https://guan-erjia.github.io/slate-vue3/examples/rich-text)

```vue
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

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Let's start" }],
  },
];
const renderElement = ({ attributes, children }) =>
  h("p", attributes, children);
const editor = withHistory(withDOM(createEditor(initialValue)));
</script>

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
```

# FAQ

### 1. Why do I have to pass renderFunction into <Slate /> component ?

This ensures that your rich text is as expected, and slate-vue3 provides some default rendering functions, you can directly use the default rendering behavior

### 2. Can I use jsx in slate-vue3 ?

Of coures yes, but we do not recommend it unless you have already configured jsx in the project, as a branch, using the h function directly is already simple enough

### 3. Why do rendering functions not use Vue components ?

Vue uses lazy updates, rendering with components generates additional state, which can cause unexpected results during updates, it would be better to use functions as branches directly

# Compact Slate

**reactive implement**

1. packages/slate/src/interfaces/text.ts 115:115
2. packages/slate/src/create-editor.ts 94:94
3. packages/slate/src/transforms-node/set-nodes.ts 18:18
4. packages/slate/src/interfaces/text.ts 116:116

**remove immer**

1. packages/slate/src/interfaces/node.ts 365:365
2. packages/slate/src/interfaces/point.ts 103:103
3. packages/slate/src/interfaces/range.ts 224:224
4. packages/slate/src/interfaces/transforms/general.ts 322:333

**other compact**

1. packages/slate/src/core/normalize-node.ts
2. packages/slate-dom/src/plugin/dom-editor.ts 421:441
