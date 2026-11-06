<template>
  <div style="line-height: 32px; padding: 32px">
    <div role="textbox" aria-label="Native" contenteditable="true">
      <div v-for="text in values" :key="text">{{ text }}</div>
    </div>
    <EditorFixture :isolated="false" />
    <EditorFixture :isolated="true" />
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, h } from "vue";
import { type Descendant } from "slate";
import { Slate, Editable, createReactiveEditor } from "slate-vue3";

const values = ["alpha", "beta", "gamma"];

const EditorFixture = defineComponent({
  name: "EditorFixture",
  props: {
    isolated: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const editor = createReactiveEditor();
    editor.isIsolated = () => props.isolated;
    const initialValue: Descendant[] = values.map((text) => ({
      type: "paragraph",
      children: [{ text }],
    }));
    editor.children = initialValue;

    return () =>
      h(
        Slate,
        { editor },
        {
          default: () =>
            h(Editable, {
              "aria-label": props.isolated ? "Isolated" : "Slate",
            }),
        },
      );
  },
});
</script>
