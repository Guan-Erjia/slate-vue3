<script setup lang="ts">
import { computed, CSSProperties, ref } from 'vue';
import { ExampleOptions } from './main'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const isMobileDevice = computed(() => {
  const ua = window.navigator.userAgent;

  const isAndroid = ua.includes('Android');
  const isMobile = ua.includes('Mobile') || isAndroid;
  const isFireFox = /(?:Firefox)/.test(ua);
  // 是否为平板
  const isTablet =
    /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua));

  return (isMobile && !isTablet);
})

const isFold = ref(false)

const olStyle = computed<CSSProperties>(() => ({
  flexShrink: 0,
  boxSizing: 'border-box',
  height: 'calc(100%-32px)',
  width: '200px',
  paddingInlineStart: '30px',
  overflowY: 'auto',
  marginTop: 0,
  backgroundColor: 'white',
  zIndex: 999,
  position: isMobileDevice.value ? 'absolute' : 'static',
}))

const handleContainerClick = () => {
  if (isMobileDevice.value) {
    isFold.value = true;
  }
}
</script>

<template>
  <header class="header">
    <span>SlateVue3 Examples</span>
    <div style="flex-grow: 1;min-width: 0;"></div>
    <div v-if="isMobileDevice" @click="isFold = !isFold"
      style="margin-right: 12px; cursor: default;font-size: 13px;font-weight: 500;" :style="{
        color: isFold ? 'white' : '#aaaaaa',
      }">
      {{ isFold ? 'Expand' : 'Fold' }} Menu
    </div>
    <a href="https://github.com/Guan-Erjia/slate-vue3" target="_blank">GitHub</a>
  </header>
  <div style="display: flex;height: calc(100% - 50px);">
    <ol v-show="!isFold" :style="olStyle">
      <RouterLink :to="item.name" v-for="item in ExampleOptions">
        <li style="text-decoration: none;margin: 10px 0;" :style="{
          color: item.name === route.name ? '#0366d6' : undefined,
          fontWeight: item.name === route.name ? 500 : undefined,
        }">{{ item.name }}</li>
      </RouterLink>
    </ol>
    <div class="scroll-container" @click="handleContainerClick">
      <header style="display: flex; padding-top: 20px;">
        <span style="cursor: default;font-size: 20px;"> {{ route.name }} </span>
        <div style="flex-grow: 1;"></div>
        <a target="_blank"
          :href="`https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/docs/pages${route.path}`">
          view code</a>
      </header>
      <div style="margin-top: 10px; padding: 10px;box-sizing: border-box;background-color: white;position: relative;">
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
