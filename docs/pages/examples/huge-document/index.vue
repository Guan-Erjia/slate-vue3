<script setup lang="ts">
import {
  Slate,
  Editable,
  type RenderElementProps,
  createReactiveEditor,
} from "slate-vue3";
import { h } from "vue";
import { faker } from "@faker-js/faker";
import { Descendant } from "slate-vue3/core";
import { withHistory } from "slate-vue3/history";

const HEADINGS = 100;
const PARAGRAPHS = 7;
const initialValue: Descendant[] = [];

for (let h = 0; h < HEADINGS; h++) {
  initialValue.push({
    type: "heading",
    depth: 1,
    children: [{ text: faker.lorem.sentence() }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValue.push({
      type: "paragraph",
      children: [{ text: faker.lorem.paragraph() }],
    });
  }
}

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case "heading":
      return h(`h${element.depth}`, attributes, children);
    default:
      return h("p", attributes, children);
  }
};
const editor = withHistory(createReactiveEditor());
editor.children = initialValue;
</script>
<template>
  <Slate :editor :render-element>
    <Editable placeholder="Enter a title…" spellcheck />
  </Slate>
</template>
