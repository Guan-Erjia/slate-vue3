<template>
  <span :style="computedStyle" :contenteditable="false" :data-cy="`mention-${element.character.replace(' ', '-')}`">
    <!-- Prevent Chromium from interrupting IME when moving the cursor  1. span + inline-block 2. div + contenteditable=false -->
    <div :contenteditable="false">
      <!-- Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490 -->
      <!-- Others like Android https://github.com/ianstormtaylor/slate/pull/5360 -->
      <slot v-if="IS_MAC"></slot>
      @{{ props.element.character }}
      <slot v-if="!IS_MAC"></slot>
    </div>
  </span>
</template>
<script setup lang="ts">
import { useFocused, useSelected } from 'slate-vue3';
import { computed } from 'vue';

const IS_MAC =
  typeof navigator !== "undefined" && /Mac OS X/.test(navigator.userAgent);
const selected = useSelected()
const focused = useFocused()
const props = defineProps<{
  element: any
}>()

const computedStyle = computed(() => ({
  padding: '3px 3px 2px',
  margin: '0 1px',
  verticalAlign: 'baseline',
  display: 'inline-block',
  borderRadius: '4px',
  backgroundColor: '#eee',
  fontSize: '0.9em',
  fontWeight: props.element.children[0].bold ? 'bold' : undefined,
  fontStyle: props.element.children[0].italic ? 'italic' : undefined,
  boxShadow: selected.value && focused.value ? '0 0 0 2px #B4D5FF' : 'none'
}))
</script>