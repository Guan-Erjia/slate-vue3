<template>
  <div v-bind="attrs" data-test-id="menu">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
import { useAttrs } from 'vue';
const attrs = useAttrs()
</script>
<style scoped lang="scss">
&>* {
  display: inline-block;
}

&>*+* {
  margin-left: 15px;
}
</style>