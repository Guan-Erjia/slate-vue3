<script setup lang="ts">
import { ref } from 'vue';
import Huge from './Huge.vue';
const isFold = ref(true)
</script>
<template>
  <a style="position: absolute; top: -37px; right: 80px; cursor: pointer;" @click="isFold = !isFold">
    {{ isFold ? '展开' : '收起' }}
  </a>
  <Huge v-if="isFold" short />
  <Huge v-else />
</template>
<style scoped>
a {
  color: gray;
  text-decoration: none
}

a:hover {
  color: #aaaaaa;
}
</style>
