<template>
  <div v-bind="attrs" style="position: relative;padding: 10px;
  border-bottom: 2px solid #eee;" data-test-id="menu">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { useAttrs } from 'vue';
const attrs = useAttrs()
</script>
