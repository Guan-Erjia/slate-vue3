<script setup lang="ts">
import { Slate, Editable } from "slate-vue3";
import { createEditor } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const editor1 = withHistory(withDOM(createEditor()));
editor1.children = [
  {
    type: "paragraph",
    children: [{ text: "This editor is styled using the style prop." }],
  },
];

const editor2 = withHistory(withDOM(createEditor()));
editor2.children = [
  {
    type: "paragraph",
    children: [{ text: "This editor is styled using the className prop." }],
  },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 40px">
    <Slate :editor="editor1">
      <Editable
        style="
          background-color: rgb(255, 230, 156);
          min-height: 200px;
          outline: rgb(0, 128, 0) solid 2px;
        "
      />
    </Slate>
    <Slate :editor="editor2">
      <Editable
        style="
          background-color: rgb(218, 225, 255);
          padding: 40px;
          font-size: 20px;
          min-height: 150px;
          outline: 3px dashed rgb(0, 94, 128);
          border-radius: 20px;
          outline-offset: -10px;
          white-space: pre-wrap;
        "
      />
    </Slate>
  </div>
</template>
