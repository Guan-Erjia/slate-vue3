<template>
    <h1 v-bind="attrs" :aria-selected="selected">
        <slot></slot>
    </h1>
</template>

<script setup lang="ts">
import { useSelected } from 'slate-vue3';
import { useAttrs } from 'vue';
const attrs = useAttrs()
const selected = useSelected()
</script>