<template>
  <a v-bind="attrs" :href="safeUrl" :style="{ boxShadow: selected ? '0 0 0 3px #ddd' : '' }"
    style="color: #00e;text-decoration: underline;">
    <InlineChromiumBugfix />
    <slot></slot>
    <InlineChromiumBugfix />
  </a>
</template>
<script setup lang="ts">
import { LinkElement } from '../../custom-types';
import { useSelected } from 'slate-vue';
import { computed, HTMLAttributes, useAttrs } from 'vue';
import InlineChromiumBugfix from './InlineChromiumBugfix.vue';
const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:']

const attrs: HTMLAttributes = useAttrs()
const selected = useSelected()
const props = defineProps<{
  element: LinkElement
}>()

const safeUrl = computed(() => {
  let parsedUrl: URL | null = null
  try {
    parsedUrl = new URL(props.element.url)
  } catch { }
  if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
    return parsedUrl.href
  }
  return 'about:blank'
})
</script>