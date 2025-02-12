<template>
  <!-- Prevent Chromium from interrupting IME when moving the cursor
  1. span + inline-block 2. div + contenteditable=false -->
  <div :contentEditable="false" :style="{ boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none' }">
    <!-- Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490 -->
    <template v-if="IS_MAC">
      <slot></slot>@{{ props.element.character }}
    </template>
    <!-- Others like Android https://github.com/ianstormtaylor/slate/pull/5360 -->
    <template v-else>
      @{{ props.element.character }}
      <slot></slot>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useFocused, useSelected } from 'slate-vue';
import { IS_MAC } from '../../utils/environment';
const selected = useSelected()
const focused = useFocused()
const props = defineProps<{
  element: any
}>()
</script>