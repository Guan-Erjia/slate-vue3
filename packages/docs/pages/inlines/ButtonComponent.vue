<template>
  <span @click="onClick" style="margin: 0 0.1em;background-color: #efefef;padding: 2px 6px;
    border: 1px solid #767676; border-radius: 2px" v-bind="attrs">
    <InlineChromiumBugfix />
    <slot></slot>
    <InlineChromiumBugfix />
  </span>
</template>
<script setup lang="ts">
import InlineChromiumBugfix from './InlineChromiumBugfix.vue'
import { HTMLAttributes, useAttrs } from 'vue';
const onClick = (e: Event) => {
  // 阻止事件的默认行为
  e.preventDefault()
}
const attrs: HTMLAttributes = useAttrs()
</script>
