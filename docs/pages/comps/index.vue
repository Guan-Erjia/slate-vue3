<template>
  <div style="margin: 15px; padding: 10px;box-sizing: border-box;background-color: white;position: relative;">
    <RouterView />
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute()
</script>