# introduction

**Slate-vue3 is a rich text rendering engine based on slate implementation**

**Based on slate's excellent design, slate-vue3 can also meet high customization requirements in projects:**

1. ✍️ markdown-shortcuts
2. 🔨 code-highlighting
3. 🚀 collaborative-editing
4. 🎤 sing, jump, rap, basketball...... [click and see more example](/slate-vue3/examples/rich-text)

⠀⠀⠀⠀⠰⢷⢿⠄
⠀⠀⠀⠀⠀⣼⣷⣄
⠀⠀⣤⣿⣇⣿⣿⣧⣿⡄
⢴⠾⠋⠀⠀⠻⣿⣷⣿⣿⡀
🏀 ⠀⢀⣿⣿⡿⢿⠈⣿
⠀⠀⠀⢠⣿⡿⠁⠀⡊⠀⠙
⠀⠀⠀⢿⣿⠀⠀⠹⣿
⠀⠀⠀⠀⠹⣷⡀⠀⣿⡄
⠀⠀⠀⠀⣀⣼⣿⠀⢈⣧

## install

```bash
npm install slate-vue3
```

## minimal example

```html
<script setup lang="ts">
import { h } from "vue"
import { Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder } from "slate-vue3"
import { createEditor } from "slate-vue3/core"
import { withDOM } from "slate-vue3/dom"
import { withHistory } from "slate-vue3/history"

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Let's start"}]
  }
]
const renderElement = ({ attributes, children }) => h("p", attributes, children)
const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf" :render-placeholder="defaultRenderPlaceHolder">
    <Editable />
  </Slate>
</template>
```

Now we can proceed with enjoyable development

## why you shoule need it

#### If you want to use Slate in a Vue project, the process can be quite cumbersome, you need to do the following things:

1. requiring the introduction of react.js
2. configuring jsx compilation (if you don't want to directly use createElement api)
3. establish a message channel between slate react and existing projects

#### However, doing these things does not bring a better development experience

- react will result in additional package size
- maintaining two front-end frameworks is also difficult
- it is even more impossible to integrate Vue logic at rendering granularity
