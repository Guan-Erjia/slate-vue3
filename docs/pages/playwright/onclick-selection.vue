<script setup lang="ts">
import { createReactiveEditor, Editable, Slate } from "slate-vue3";
import type { Descendant } from "slate";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "The quick brown fox jumps over the lazy dog" }],
  },
];

const editor = createReactiveEditor();
editor.children = initialValue;

const onClick = () => {
  const log = ((window as any).__clickSelections ??= []);
  log.push(editor.selection);
};
</script>

<template>
  <Slate :editor="editor">
    <Editable @click="onClick" />
  </Slate>
</template>
