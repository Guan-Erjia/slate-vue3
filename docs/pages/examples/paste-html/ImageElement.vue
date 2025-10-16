<template>
  <div>
    <slot />
    <img
      :src="props.element.url"
      style="display: block; max-width: 100%; max-height: 20em"
      :style="{ boxShadow: selected && focused ? '0 0 0 2px blue' : 'none' }"
    />
  </div>
</template>
<script lang="ts" setup>
import { useFocused, useSelected } from "slate-vue3";
const selected = useSelected();
const focused = useFocused();
const props = defineProps<{
  element: {
    url: string;
  };
}>();
</script>
