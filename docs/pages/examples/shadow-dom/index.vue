<template>
  <div ref="containerRef" data-cy="outer-shadow-root"></div>
</template>

<script setup lang="ts">
import { createApp, onMounted, ref } from "vue";
import ShadowEditor from "./ShadowEditor.vue";

const containerRef = ref<HTMLDivElement>();

onMounted(() => {
  if (containerRef.value!.shadowRoot) return;

  // Create a shadow DOM
  const outerShadowRoot = containerRef.value!.attachShadow({ mode: "open" });
  const host = document.createElement("div");
  outerShadowRoot.appendChild(host);

  // Create a nested shadow DOM
  const innerShadowRoot = host.attachShadow({ mode: "open" });
  const root = document.createElement("div");
  innerShadowRoot.appendChild(root);
  createApp(ShadowEditor).mount(root);
});
</script>
