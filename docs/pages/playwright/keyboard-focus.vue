<template>
  <button>Before editor</button>
  <Slate :editor>
    <Editable />
  </Slate>
  <button>After editor</button>
</template>

<script setup lang="ts">
import { type Descendant } from "slate";
import { Slate, Editable, createReactiveEditor } from "slate-vue3";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "hello world" }] },
];
const editor = createReactiveEditor();
editor.children = initialValue;
</script>
