<template>
  <span v-bind="attrs" contenteditable="false">
    <button>prefix</button>
  </span>
</template>

<script setup lang="ts">
import { HTMLAttributes, useAttrs } from "vue";
const attrs: HTMLAttributes = useAttrs();
</script>
