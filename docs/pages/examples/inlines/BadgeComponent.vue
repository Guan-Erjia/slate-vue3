<template>
  <span :contenteditable="false" style="background-color: green; color: white;
    padding: 2px 6px; border-radius: 2px; font-size: 0.9em;" :style="{
      boxShadow: selected ? '0 0 0 3px #ddd' : '',
    }" :data-playwright-selected="selected">
    <InlineChromiumBugfix />
    <slot />
    <InlineChromiumBugfix />
  </span>
</template>
<script setup lang="ts">
import { useSelected } from 'slate-vue3';
import InlineChromiumBugfix from './InlineChromiumBugfix.vue'
const selected = useSelected()
</script>