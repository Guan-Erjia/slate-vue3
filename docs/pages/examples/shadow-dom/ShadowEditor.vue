<script setup lang="ts">
import { createEditor, Descendant } from "slate-vue3/core";
import { Slate, Editable, } from "slate-vue3"
import { h } from "vue";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'This Editor is rendered within a nested Shadow DOM.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'This Editor is rendered within a nested Shadow DOM.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'This Editor is rendered within a nested Shadow DOM.' }],
  },
]

const editor = withHistory(withDOM(createEditor()))
editor.children = initialValue;
</script>

<template>
  <Slate :editor="editor">
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>

<style>
[data-slate-editor]>*+* {
  margin-top: 12px;
}

[data-slate-placeholder] {
  margin-top: 0;
}
</style>
