<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import { Element, type Descendant } from "slate";
import { HistoryEditor, withHistory } from "slate-history";
import { createReactiveEditor, Editable, Slate } from "slate-vue3";

const chunks = [
  "External ",
  "text ",
  "can ",
  "arrive ",
  "while ",
  "you ",
  "keep ",
  "typing ",
  "in ",
  "another ",
  "block.",
];

const createStreamBlock = (text: string) => ({
  type: "paragraph" as const,
  streamOutput: true,
  children: [{ text }],
});

const isStreamBlock = (node: Descendant) =>
  Element.isElement(node) &&
  "streamOutput" in node &&
  node.streamOutput === true;

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "Type here: " }] },
  createStreamBlock("Stream output will appear here."),
];

const withStreamOutsideHistory = (
  editor: ReturnType<typeof createReactiveEditor>,
) => {
  const { setChildren } = editor;
  editor.setChildren = (children) =>
    HistoryEditor.withoutSaving(editor, () => setChildren(children));
  return editor;
};

const editor = withStreamOutsideHistory(withHistory(createReactiveEditor()));
editor.children = initialValue;

const value = ref<Descendant[]>(initialValue);
const streaming = ref(false);
const complete = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const updateTypedBlocks = (next: Descendant[]) => {
  const output = value.value[value.value.length - 1];

  if (next[next.length - 1] === output) {
    value.value = next;
    return;
  }

  const input = next.filter((node) => !isStreamBlock(node));

  if (!input.length) {
    input.push({ type: "paragraph", children: [{ text: "" }] });
  }

  value.value = [...input, output];
};

const start = () => {
  streaming.value = true;
  complete.value = false;
  let index = 0;
  let text = "";

  timer = setInterval(() => {
    text += chunks[index++];
    const streamed = text;
    value.value = [...value.value.slice(0, -1), createStreamBlock(streamed)];

    if (index === chunks.length) {
      clearInterval(timer!);
      timer = null;
      streaming.value = false;
      complete.value = true;
    }
  }, 100);
};

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <p>
    Type in the first paragraph while external text streams into the second.
    Undo keeps the streamed text and removes your typing.
  </p>
  <button type="button" :disabled="streaming" @mousedown.prevent @click="start">
    Start stream
  </button>
  <output aria-live="polite">
    {{ streaming ? "Streaming" : complete ? "Complete" : "Ready" }}
  </output>
  <Slate :editor :value :on-value-change="updateTypedBlocks">
    <Editable aria-label="Controlled editor" placeholder="Type here..." />
  </Slate>
</template>
