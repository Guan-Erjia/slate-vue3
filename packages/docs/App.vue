<script setup lang="ts">
import { ExampleOptions } from './main'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <header class="header">
    <span>SlateVue3 Examples</span>
    <div style="flex-grow: 1;min-width: 0;"></div>
    <a href="https://github.com/Guan-Erjia/slate-vue3" target="_blank">GitHub</a>
  </header>
  <div style="display: flex;height: calc(100% - 50px);">
    <ol style="width: 200px;flex-shrink: 0;box-sizing: border-box;height: calc(100%-32px);overflow-y: auto;">
      <RouterLink :to="item.name" v-for="item in ExampleOptions">
        <li style="text-decoration: none;margin-bottom: 10px;" :style="{
          color: item.name === route.name ? '#0366d6' : undefined,
          fontWeight: item.name === route.name ? 500 : undefined,
        }">{{ item.name }}</li>
      </RouterLink>
    </ol>
    <div class="scroll-container">
      <header style="display: flex; padding-top: 20px;" :id="route.path">
        <span style="cursor: default;font-size: 20px;"> {{ route.name }} </span>
        <div style="flex-grow: 1;"></div>
        <a target="_blank"
          :href="`https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/docs/pages${route.path}`">
          view code</a>
      </header>
      <div style="margin-top: 10px;box-sizing: border-box;background-color: white;position: relative;">
        <RouterView />
      </div>
    </div>
  </div>
</template>
<style scoped>
.header {
  box-sizing: border-box;
  padding: 0 20px;
  background-color: black;
  display: flex;
  width: 100%;
  color: #aaaaaa;
  height: 50px;
  align-items: center;
  box-sizing: border-box;
}

.scroll-container {
  min-width: 0;
  flex-grow: 1;
  padding: 0 20px 20px 20px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  scroll-behavior: smooth;
}
</style>
