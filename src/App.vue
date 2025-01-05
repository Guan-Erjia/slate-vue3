<script setup lang="ts">
import { createEditor } from "slate";
import { Slate } from "./components/slate";
import { Editable } from "./components/editable";
import { h, ref } from "vue";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  }, {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  }, {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  }, {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

const editor = ref(createEditor())
const renderElement = ({ attributes, children, }) => {
  return h('p', attributes, children)
}

const renderLeaf = ({ attributes, children, }) => {
  return h('span', attributes, children)
}

</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <Slate :initial-value="initialValue" :editor="editor">
    <div style="height: 20px; background-color: red"></div>
    <Editable placeholder="Enter some rich text…" spellCheck autoFocus :render-element="renderElement"
      :render-leaf="renderLeaf" />
  </Slate>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
