<template>
  <header style="display: flex;">
    <span style="cursor: default;font-size: 20px;"> {{ route.name }} </span>
    <div style="flex-grow: 1;"></div>
    <a :href="`https://github.com/Guan-Erjia/slate-vue3/tree/master${route.path}`"
      target="_blank">
      view code</a>
  </header>
  <div style="margin: 15px; padding: 10px;box-sizing: border-box;background-color: white;position: relative;">
    <RouterView />
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router';

const route = useRoute()
console.log(route)
</script>

<style scoped>
header {
  margin: 20px;
}
</style>