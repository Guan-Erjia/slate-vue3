<template>
  <header>
    <a href="https://docs.slatejs.org" target="_blank" style="color: white"
      >slate</a
    >
    <a href="https://vuejs.org" target="_blank" style="color: #35eb9a">-vue3</a>
    <div style="flex-grow: 1; min-width: 0"></div>
    <button
      v-if="isMobileDevice"
      :style="{ color: isFold ? 'white' : '#aaaaaa' }"
      @click="isFold = !isFold"
    >
      {{ isFold ? "Expand" : "Fold" }} Menu
    </button>
    <a
      v-else
      style="margin-right: 20px"
      href="https://docs.slatejs.org"
      target="_blank"
      >Docs</a
    >
    <a href="https://github.com/Guan-Erjia/slate-vue3" target="_blank"
      >GitHub</a
    >
  </header>
</template>
<script lang="ts" setup>
import { computed, inject } from "vue";
const isFold = inject("IS_FOLD");

const isMobileDevice = computed(() => {
  const ua = window.navigator.userAgent;
  const isAndroid = ua.includes("Android");
  const isMobile = ua.includes("Mobile") || isAndroid;
  const isFireFox = /(?:Firefox)/.test(ua);
  // 是否为平板
  const isTablet =
    /(?:iPad|PlayBook)/.test(ua) ||
    (isAndroid && !/(?:Mobile)/.test(ua)) ||
    (isFireFox && /(?:Tablet)/.test(ua));

  return isMobile && !isTablet;
});
</script>

<style scoped>
header {
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

button {
  margin-right: 12px;
  cursor: default;
  font-size: 13px;
  font-weight: 500;
  background-color: transparent;
  border: none;
}
</style>
