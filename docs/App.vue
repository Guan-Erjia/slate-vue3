<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Menu from './components/Menu.vue'

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

provide("IS_FOLD", isFold)

const handleContainerClick = () => {
  if (isMobileDevice.value) {
    isFold.value = true;
  }
}
</script>

<template>
  <Header />
  <div style="display: flex;height: calc(100% - 50px);">
    <Menu />
    <div class="scroll-container" @click="handleContainerClick">
      <RouterView />
    </div>
  </div>
</template>
<style scoped>
.scroll-container {
  min-width: 0;
  flex-grow: 1;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
