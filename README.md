# slate-vue3

<p align="center">
  <img src="https://github.com/Guan-Erjia/slate-vue3/blob/master/public/banner.png" alt="slate-vue3 - Slate.js for Vue 3" />
</p>

<p align="center">
  <strong>A Slate.js rich text editor framework for Vue 3.</strong>
</p>

<p align="center">
  A Vue 3 implementation of the <a href="https://github.com/ianstormtaylor/slate">Slate</a> rich text editor framework, inspired by <a href="https://react.dev/">slate-react</a> and built for the Vue ecosystem.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/slate-vue3">
    <img src="https://img.shields.io/npm/v/slate-vue3.svg?maxAge=3600&label=version&colorB=007ec6" alt="npm version" />
  </a>
  <a href="https://bundlephobia.com/package/slate-vue3">
    <img src="https://img.shields.io/bundlephobia/min/slate-vue3" alt="Minified bundle size" />
  </a>
  <a href="https://join.slack.com/t/slate-js/shared_invite/zt-f8t986ip-7dA1DyiqPpzootz1snKXkw">
    <img src="https://img.shields.io/badge/slack-slate--js-brightgreen.svg?logo=slack" alt="Slate Slack" />
  </a>
  <a href="https://github.com/Guan-Erjia/slate-vue3">
    <img src="https://img.shields.io/github/stars/Guan-Erjia/slate-vue3?style=social" alt="GitHub stars" />
  </a>
</p>

---

> [!IMPORTANT]
> **🚧 Major Refactor Notice**
>
> This project has undergone a large-scale refactor. The core library and its surrounding ecosystem packages have been fully rewritten to align with the official Slate implementations.
>
> If you are upgrading from an older version, please read the migration guide carefully. Some legacy APIs may no longer be compatible.

<br />

### What is slate-vue3?

**slate-vue3** brings the powerful and customizable [Slate](https://github.com/ianstormtaylor/slate) rich text editor framework

<br />

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

#### 2. Now, you can use it in vue-sfc :point_right: [**live demo**](https://guan-erjia.github.io/slate-vue3/examples/richtext)

```vue
<script setup lang="ts">
import { Slate, Editable, createReactiveEditor } from "slate-vue3";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Let's start" }],
  },
];
const editor = createReactiveEditor();
</script>

<template>
  <Slate :editor :initial-value>
    <Editable />
  </Slate>
</template>
```

<br />

### Examples

To get a sense for how you might use Slate, check out a few of the examples:

- [**Rich text**](https://guan-erjia.github.io/slate-vue3/examples/richtext) — the features you'd expect from a basic editor.
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

### Library build

`pnpm build-all` produces one JavaScript file per entry: `dist/index.js`,
`dist/dom.js`, and `dist/yjs.js`. The entries import each other where needed
to share editor state; TypeScript declarations are emitted separately.
Run `pnpm test:build` to verify the build output.

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

| **Package**                              |                                                                      **Version** | **Description**             |
| :--------------------------------------- | -------------------------------------------------------------------------------: | :-------------------------- |
| [`slate-vue3/dom`](./packages/slate-dom) | ![](https://img.shields.io/npm/v/slate-dom.svg?maxAge=3600&label=&colorB=007ec6) | DOM implementation of slate |
| [`slate-vue3/yjs`](./packages/slate-yjs) | ![](https://img.shields.io/npm/v/slate-yjs.svg?maxAge=3600&label=&colorB=007ec6) | integration of `slate-yjs`  |

<br />

### Contributing!

Welcome to provide suggestions on the issue, it would be even better if **`PR`** could be mentioned along with it

`slate-vue3` is [MIT-licensed](./License.md).

<br/>
