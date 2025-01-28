<template>
  <div v-bind="attrs" class="instruction">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
import { useAttrs } from 'vue';
const attrs = useAttrs()
</script>
<style scoped>
.instruction {
  white-space: pre-wrap;
  margin: 0 -20px 10px;
  padding: 10px 20px;
  font-size: 14px;
  background: #f8f8e8;

}
</style>