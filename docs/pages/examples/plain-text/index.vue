<script setup lang="ts">
import { Slate, Editable } from "slate-vue3";
import { createEditor, Descendant } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable plain text, just like a <textarea>!" },
    ],
  },
];

const editor = withHistory(withDOM(createEditor()));
editor.children = initialValue;
</script>

<template>
  <Slate :editor>
    <Editable placeholder="Enter some plain text..." />
  </Slate>
</template>
