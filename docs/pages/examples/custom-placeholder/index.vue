<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderPlaceholderProps,
  createReactiveEditor,
} from "slate-vue3";
import { h } from "vue";
import { Descendant } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

const renderPlaceholder = ({
  children,
  attributes,
}: RenderPlaceholderProps) => {
  return h("div", attributes, [
    h("p", null, children),
    h(
      "pre",
      null,
      "Use the renderPlaceholder prop to customize rendering of the placeholder",
    ),
  ]);
};
const editor = withHistory(createReactiveEditor());
editor.children = initialValue;
</script>

<template>
  <Slate :editor :render-placeholder>
    <Editable style="padding: 10px" placeholder="Type something" />
  </Slate>
</template>
