<template>
  <span v-bind="attrs" class="material-icons" style="font-size: 18px;
  vertical-align: text-bottom;
  cursor: pointer;
  margin-right: 15px;
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;"
    :style="{ color: props.reversed ? props.active ? 'white' : '#aaa' : props.active ? 'black' : '#ccc' }">
    <slot></slot>
  </span>
</template>
<script lang="ts" setup>
import { HTMLAttributes, useAttrs } from 'vue';
const attrs: HTMLAttributes = useAttrs()
const props = defineProps<{
  active?: boolean
  reversed?: boolean
}>()
</script>