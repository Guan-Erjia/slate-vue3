<template>
  <Markdown :content="content" />
</template>
<script setup lang="ts">
import Markdown from '../../components/Markdown.vue';
import content from './use-inherit-ref.md?raw'
</script>