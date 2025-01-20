<template>
  <span v-bind="attrs" class="button"
    :style="{ color: props.reversed ? props.active ? 'white' : '#aaa' : props.active ? 'black' : '#ccc' }">
    <slot></slot>
  </span>
</template>
<script lang="ts" setup>
import { useAttrs } from 'vue';

const attrs = useAttrs()
const props = defineProps<{
  active: boolean
  reversed: boolean
}>()
</script>
<style scoped>
.button {
  cursor: pointer;
}
</style>