[<img src="https://github.com/Guan-Erjia/slate-vue3/blob/master/public/banner.png" />](https://github.com/ianstormtaylor/slate)

<p align="center">
  slate-<a style="color: #087ea4" href="https://react.dev/">react</a> library implemented with <a style="color: #42b883" href="https://vuejs.org/">vue3</a>
</p>

<p align="center">
  <a href="https://unpkg.com/slate-vue3/dist/index.js">
    <img src="https://packagephobia.com/badge?p=slate-vue3">
  </a>
  <a href="https://join.slack.com/t/slate-js/shared_invite/zt-f8t986ip-7dA1DyiqPpzootz1snKXkw">
    <img src="https://img.shields.io/badge/slack-slate--js-brightgreen.svg?logo=slack">
  </a>
  <a href="./packages/slate-vue3/package.json">
    <img src="https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=version&colorB=007ec6">
  </a>
</p>
<br/>

### Why use it?

1. :sparkles: Highly customizable features, use slate core at the bottom level
2. :zap: Use `vue3` for high-performance rendering, and later connect to vapor mode
3. :coffee: The **latest** version of the core, design tends to be stable

<br />

### How to use?

#### 1. Install slate-vue3

```sh
npm install slate-vue3
```

#### 2. Now, you can use it in vue-sfc :point_right: [**live demo**](https://guan-erjia.github.io/slate-vue3/examples/rich-text)

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
const editor = withHistory(withDOM(createEditor()));
editor.children = initialValue;
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

<br />

### Examples

To get a sense for how you might use Slate, check out a few of the examples:

- [**Rich text**](https://guan-erjia.github.io/slate-vue3/examples/rich-text) — the features you'd expect from a basic editor.
- [**Collaborative editing**](https://guan-erjia.github.io/slate-vue3/examples/remote-cursor) — to achieve collaborative editing and cursor.
- [**Markdown preview**](https://guan-erjia.github.io/slate-vue3/examples/markdown-preview) — to add key handlers for Markdown-like shortcuts.
- [**Inlines**](https://guan-erjia.github.io/slate-vue3/examples/inlines) — wrap text in inline nodes with associated data.
- [**Images**](https://guan-erjia.github.io/slate-vue3/examples/images) — to use void (text-less) nodes to add images.
- [**Hovering toolbar**](https://guan-erjia.github.io/slate-vue3/examples/hovering-toolbar) — a hovering toolbar can be implemented.
- [**Tables**](https://guan-erjia.github.io/slate-vue3/examples/tables) — to nest blocks to render more advanced components.
- [**Paste HTML**](https://guan-erjia.github.io/slate-vue3/examples/paste-html) — to use an HTML serializer to handle pasted HTML.
- [**Mentions**](https://guan-erjia.github.io/slate-vue3/examples/mentions) — to use inline void nodes for simple @-mentions.
- [**See all the examples...**](https://guan-erjia.github.io/slate-vue3)

If you have an idea for an example that shows a common use case, pull request it!

<br/>

### Documentation

This [**`document`**](https://guan-erjia.github.io/slate-vue3) serves only as a supplement to the slate document and mainly provides case studies and differences between `slate-vue3` and `slate-react`

If you're using `slate` for the first time, check out the [Getting Started](https://docs.slatejs.org/walkthroughs/01-installing-slate) walkthroughs and the [Concepts](http://docs.slatejs.org/concepts) to familiarize yourself with slate's architecture and mental models.

- [**Walkthroughs**](https://docs.slatejs.org/walkthroughs/01-installing-slate)
- [**Concepts**](https://docs.slatejs.org/concepts)
- [**FAQ**](https://docs.slatejs.org/general/faq)
- [**Resources**](https://docs.slatejs.org/general/resources)

<br/>

### Sub packages

Due to the complexity of maintaining multiple packages and the lack of reusability of sub packages in other frameworks, slate-vue3 does not use workspace and only performs sub packaging during packaging

| **Package**                                              |                                                                       **Version** | **Description**                                  |
| :------------------------------------------------------- | --------------------------------------------------------------------------------: | :----------------------------------------------- |
| [`slate-vue3/core`](./packages/slate)                    | ![](https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=&colorB=007ec6) | slate's core data model logic.                   |
| [`slate-vue3/dom`](./packages/slate)                     | ![](https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=&colorB=007ec6) | DOM implementation of slate                      |
| [`slate-vue3/history`](./packages/slate-history)         | ![](https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=&colorB=007ec6) | a plugin that adds undo/redo history to slate.   |
| [`slate-vue3/hyperscript`](./packages/slate-hyperscript) | ![](https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=&colorB=007ec6) | a hyperscript tool to write JSX slate documents! |
| [`slate-vue3/yjs`](./packages/slate-yjs)                 | ![](https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=&colorB=007ec6) | integration of `slate-yjs`                       |

<br />

### Contributing!

Welcome to provide suggestions on the issue, it would be even better if **`PR`** could be mentioned along with it

`slate-vue3` is [MIT-licensed](./License.md).

<br/>

### FAQ

##### 1. Why do I have to pass renderFunction into <Slate /> component ?

This ensures that your rich text is as expected, and slate-vue3 provides some default rendering functions, you can directly use the default rendering behavior

##### 2. Can I use jsx in slate-vue3 ?

Of coures yes, but we do not recommend it unless you have already configured jsx in the project, as a branch, using the h function directly is already simple enough

##### 3. Why do rendering functions not use vue components ?

Vue uses lazy updates, rendering with components generates additional state, which can cause unexpected results during updates, it would be better to use functions as branches directly
