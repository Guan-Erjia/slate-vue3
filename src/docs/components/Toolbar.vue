<template>
  <div v-bind="attrs" data-test-id="menu">
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
  padding: 1px 18px 17px;
  margin: 0 -20px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
}
</style>