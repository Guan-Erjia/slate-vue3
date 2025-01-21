<template>
  <span v-bind="attrs" class="material-icons icon"
    :style="{ color: props.reversed ? props.active ? 'white' : '#aaa' : props.active ? 'black' : '#ccc' }" style="">
    <slot></slot>
  </span>
</template>
<script lang="ts" setup>
import { useAttrs } from 'vue';

const attrs = useAttrs()
const props = defineProps<{
  active: boolean
  reversed?: boolean
}>()
</script>
<style scoped>
.icon {
  font-size: 18px;
  vertical-align: text-bottom;
  cursor: pointer;
  margin-right: 15px;
}

.material-icons {

  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>