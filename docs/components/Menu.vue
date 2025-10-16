<template>
  <menu v-show="!isFold" :style="menuStyle">
    <template v-for="menu in menuConfig" :key="menu.title">
      <RouterLink class="header" :to="{ name: menu.sub[0].name }">
        {{ menu.title }}
      </RouterLink>
      <ul>
        <RouterLink :to="{ name: item.name }" v-for="item in menu.sub" :key="item.name">
          <li :style="{
            color: item.name === route.name ? '#0366d6' : undefined,
            fontWeight: item.name === route.name ? 500 : undefined,
          }">{{ item.name }}</li>
        </RouterLink>
      </ul>
    </template>
  </menu>
</template>
<script lang="ts" setup>
import { computed, CSSProperties, inject } from 'vue'
import { EXAMPLE_RECORD, COMPONENTS_RECORD, HOOKS_RECORD, PACKAGES_RECORD, INTRODUCTION_RECORD } from '../routes'
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
const isFold = inject('IS_FOLD')

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
const menuStyle = computed<CSSProperties>(() => ({
  height: isMobileDevice.value ? 'calc(100% - 50px)' : '100%',
  position: isMobileDevice.value ? 'absolute' : 'static',
}))
const menuConfig = computed(() => [
  {

    title: 'INTRODUCTION',
    name: 'examples',
    sub: INTRODUCTION_RECORD,
  },
  {
    title: 'COMPONENTS',
    name: 'examples',
    sub: COMPONENTS_RECORD,
  },
  {
    title: 'HOOKS',
    name: 'examples',
    sub: HOOKS_RECORD,
  },
  {
    title: 'SUB_PACKAGES',
    name: 'examples',
    sub: PACKAGES_RECORD,
  },
  {
    title: 'EXAMPLES',
    name: 'examples',
    sub: EXAMPLE_RECORD,
  },
])
</script>
<style scoped>
menu {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 200px;
  padding-inline-start: 0;
  overflow-y: auto;
  background-color: white;
  margin: 0;
  z-index: 999;
  padding: 10px 0;
}

ul {
  padding-inline-start: 0;
  margin: 0;
}

li {
  text-decoration: none;
  margin: 10px 0;
  list-style: none;
  font-size: 14px;
  padding-left: 20px;
}

.header {
  margin: 0;
  margin-left: 10px;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
}
</style>