<template>
  <span v-bind="attrs" class="icon material-icons">
    <slot></slot>
  </span>
</template>

<script lagn="ts" setup>
const attrs = useAttrs();
</script>
<style scoped>
.icon {
  font-size: 18px;
  vertical-align: text-bottom;
}
</style>