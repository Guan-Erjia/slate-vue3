<script setup lang="ts">
import { Descendant } from "slate-vue3/core";
import { Slate, Editable, createReactiveEditor } from "slate-vue3";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "This example shows what happens when the Editor is set to readOnly, it is not editable",
      },
    ],
  },
];

const editor = withHistory(createReactiveEditor());
editor.children = initialValue;
</script>

<template>
  <Slate :editor>
    <Editable :read-only="true" placeholder="Enter some plain text..." />
  </Slate>
</template>
