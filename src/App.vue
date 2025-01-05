<script setup lang="ts">
import { createEditor } from "slate";
import Slate from "./components/Slate.vue";
import { Editable } from "./components/editable";
import { ref } from "vue";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
];

const editor = ref(createEditor())
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
    <Editable placeholder="Enter some rich text…" spellCheck autoFocus />
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
