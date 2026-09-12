<script setup lang="ts">
import { Slate, Editable, createReactiveEditor } from "slate-vue3";
import { Descendant } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable plain text, just like a <textarea>!" },
    ],
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
