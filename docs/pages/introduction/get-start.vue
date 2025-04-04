<template>
  <MarkButton :content="content" />
</template>
<script setup lang="ts">
import MarkButton from '../../components/Markdown.vue';
import content from './get-start.md?raw'
</script>
