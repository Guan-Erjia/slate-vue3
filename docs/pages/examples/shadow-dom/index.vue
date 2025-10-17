<template>
  <div ref="container" data-cy="outer-shadow-root" />
</template>

<script setup lang="ts">
import { createApp, onMounted, useTemplateRef } from "vue";
import ShadowEditor from "./ShadowEditor.vue";

const containerRef = useTemplateRef<HTMLDivElement>("container");

onMounted(() => {
  if (!containerRef.value) return;
  if (containerRef.value.shadowRoot) return;

  // Create a shadow DOM
  const outerShadowRoot = containerRef.value.attachShadow({ mode: "open" });
  const host = document.createElement("div");
  outerShadowRoot.appendChild(host);

  // Create a nested shadow DOM
  const innerShadowRoot = host.attachShadow({ mode: "open" });
  const root = document.createElement("div");
  innerShadowRoot.appendChild(root);
  createApp(ShadowEditor).mount(root);
});
</script>
