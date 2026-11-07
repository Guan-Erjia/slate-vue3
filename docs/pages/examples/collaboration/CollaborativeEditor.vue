<script setup lang="ts">
import { Slate, Editable, createReactiveEditor } from "slate-vue3";
import { withYHistory, withYjs, YjsEditor } from "slate-vue3/yjs";
import { Editor, Transforms, type Descendant } from "slate";
import { onMounted, onUnmounted } from "vue";
import * as Y from "yjs";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

const props = defineProps<{
  document: Y.Doc;
  name: string;
}>();

const editor = withYHistory(
  withYjs(createReactiveEditor(), props.document.get("content", Y.XmlText)),
);
editor.children = initialValue;

const { applyRemoteEvents } = editor;
editor.applyRemoteEvents = (events, origin) => {
  Editor.withRemoteChanges(editor, () => applyRemoteEvents(events, origin));
};

const { normalizeNode } = editor;
editor.normalizeNode = (entry, options) => {
  const [node] = entry;
  if (Editor.isEditor(node) && node.children.length === 0) {
    Transforms.insertNodes(editor, initialValue, { at: [0] });
    return;
  }
  normalizeNode(entry, options);
};

onMounted(() => {
  YjsEditor.connect(editor);
});

onUnmounted(() => {
  YjsEditor.disconnect(editor);
});
</script>

<template>
  <section :aria-label="`${name}'s editor`">
    <h2>{{ name }}</h2>
    <button type="button" @mousedown.prevent @click="editor.undo()">
      Undo {{ name }}
    </button>
    <button type="button" @mousedown.prevent @click="editor.redo()">
      Redo {{ name }}
    </button>
    <Slate :editor :initial-value="initialValue">
      <Editable
        :aria-label="`${name}'s document`"
        placeholder="Type here..."
        style="min-height: 120px; padding: 12px; border: 1px solid #ddd"
      />
    </Slate>
  </section>
</template>
