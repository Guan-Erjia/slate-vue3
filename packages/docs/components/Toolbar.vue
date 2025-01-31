<template>
  <div v-bind="attrs" class="menu" data-test-id="menu">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { useAttrs } from 'vue';

const attrs = useAttrs()

</script>
<style scoped>
.menu {
  position: relative;
  padding: 10px;
  border-bottom: 2px solid #eee;
}
</style>