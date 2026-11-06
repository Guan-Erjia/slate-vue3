<template>
  <header
    ref="header"
    data-testid="sticky-header"
    style="
      position: sticky;
      top: 0;
      height: 80px;
      background: white;
      z-index: 1;
    "
  >
    Sticky header
  </header>
  <div ref="counter" data-testid="scroll-calls" :data-count="calls"></div>
  <Slate :editor="editor">
    <Editable
      style="line-height: 24px; padding-bottom: 500px"
      :scroll-selection-into-view="scrollSelectionIntoView"
    />
  </Slate>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { type Descendant, type Editor } from "slate";
import { Slate, Editable, createReactiveEditor } from "slate-vue3";

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      {
        text: Array.from(
          { length: 40 },
          (_, index) => `Line ${index}: some text`,
        ).join("\n"),
      },
    ],
  },
];

const editor = createReactiveEditor();
editor.children = initialValue;

const counter = ref<HTMLDivElement | null>(null);
const header = ref<HTMLElement | null>(null);
const calls = ref(0);

// 自定义滚动逻辑：让选区进入视口，同时避开 80px 的 sticky header
function scrollSelectionIntoView(_editor: Editor, range: Range) {
  calls.value += 1;
  const container = counter.value!.closest<HTMLElement>(
    '[data-testid="container"]',
  )!;
  const rect = range.getBoundingClientRect();
  const top = header.value!.getBoundingClientRect().bottom;
  const bottom = container.getBoundingClientRect().bottom;
  if (rect.top < top) {
    container.scrollBy(0, rect.top - top);
  } else if (rect.bottom > bottom) {
    container.scrollBy(0, rect.bottom - bottom);
  }
}
</script>
