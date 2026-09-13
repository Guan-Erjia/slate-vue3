<script setup lang="ts">
import { Descendant } from "slate";
import { Slate, Editable, createReactiveEditor } from "slate-vue3";
import { withHistory } from "slate-history";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "This Editor is rendered within a nested Shadow DOM." }],
  },
  {
    type: "paragraph",
    children: [{ text: "This Editor is rendered within a nested Shadow DOM." }],
  },
  {
    type: "paragraph",
    children: [{ text: "This Editor is rendered within a nested Shadow DOM." }],
  },
];

const editor = withHistory(createReactiveEditor());
editor.children = initialValue;
</script>

<template>
  <Slate :editor>
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>

<style>
[data-slate-editor] > * + * {
  margin-top: 12px;
}

[data-slate-placeholder] {
  margin-top: 0;
}
</style>
