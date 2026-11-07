<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from "vue";
import * as Y from "yjs";
import { slateNodesToInsertDelta } from "slate-vue3/yjs";
import type { Descendant } from "slate";
import CollaborativeEditor from "./CollaborativeEditor.vue";

const initialValue: Descendant[] = [
  { type: "paragraph", children: [{ text: "" }] },
];

type SyncMessage = { type: "request" } | { type: "update"; update: Uint8Array };

type Connection = {
  document: Y.Doc;
  channel: BroadcastChannel;
  publish: (update: Uint8Array, origin: unknown) => void;
};

const createSharedDocument = () => {
  const template = new Y.Doc();
  template.clientID = 0;
  template
    .get("content", Y.XmlText)
    .applyDelta(slateNodesToInsertDelta(initialValue));
  const document = new Y.Doc();
  Y.applyUpdate(document, Y.encodeStateAsUpdate(template));
  template.destroy();
  return document;
};

const documents = shallowRef<Y.Doc[]>([]);
let connections: Connection[] = [];

onMounted(() => {
  connections = ["Alice", "Bob"].map(() => {
    const document = createSharedDocument();
    const channel = new BroadcastChannel("slate-collaboration-example");
    const publish = (update: Uint8Array, origin: unknown) => {
      if (origin !== channel) channel.postMessage({ type: "update", update });
    };
    channel.onmessage = ({ data }: MessageEvent<SyncMessage>) => {
      if (data.type === "request") {
        channel.postMessage({
          type: "update",
          update: Y.encodeStateAsUpdate(document),
        });
      } else {
        Y.applyUpdate(document, data.update, channel);
      }
    };
    document.on("update", publish);
    channel.postMessage({ type: "request" });
    return { document, channel, publish };
  });
  documents.value = connections.map(({ document }) => document);
});

onUnmounted(() => {
  connections.forEach(({ document, channel, publish }) => {
    document.off("update", publish);
    channel.close();
    document.destroy();
  });
  connections = [];
});
</script>

<template>
  <div>
    <p>
      Edit either view of the shared document. Open this example in another tab
      to collaborate in the same browser. Closing every tab clears the document.
    </p>
    <div
      v-if="documents.length > 0"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 24px;
      "
    >
      <CollaborativeEditor :document="documents[0]" name="Alice" />
      <CollaborativeEditor :document="documents[1]" name="Bob" />
    </div>
  </div>
</template>
