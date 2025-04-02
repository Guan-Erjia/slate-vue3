<template>
    <menu v-show="!isFold" :style="menuStyle">
        <h2>INTRODUCTION</h2>
        <RouterLink :to="{ name: item.name }" v-for="item in INTRODUCTION_RECORD">
            <li :style="{
                color: item.name === route.name ? '#0366d6' : undefined,
                fontWeight: item.name === route.name ? 500 : undefined,
            }">{{ item.name }}</li>
        </RouterLink>
        <h2>COMPONENTS</h2>
        <ul>
            <RouterLink :to="{ name: item.name }" v-for="item in COMPONENTS_RECORD">
                <li :style="{
                    color: item.name === route.name ? '#0366d6' : undefined,
                    fontWeight: item.name === route.name ? 500 : undefined,
                }">{{ item.name }}</li>
            </RouterLink>
        </ul>
        <h2>HOOKS</h2>
        <ul>
            <RouterLink :to="{ name: item.name }" v-for="item in HOOKS_RECORD">
                <li :style="{
                    color: item.name === route.name ? '#0366d6' : undefined,
                    fontWeight: item.name === route.name ? 500 : undefined,
                }">{{ item.name }}</li>
            </RouterLink>
        </ul>
        <h2>SUB_PACKAGES</h2>
        <ul>
            <RouterLink :to="{ name: item.name }" v-for="item in PACKAGES_RECORD">
                <li :style="{
                    color: item.name === route.name ? '#0366d6' : undefined,
                    fontWeight: item.name === route.name ? 500 : undefined,
                }">{{ item.name }}</li>
            </RouterLink>
        </ul>
        <h2>EXAMPLES</h2>
        <ul>
            <RouterLink :to="{ name: item.name }" v-for="item in EXAMPLE_RECORD">
                <li :style="{
                    color: item.name === route.name ? '#0366d6' : undefined,
                    fontWeight: item.name === route.name ? 500 : undefined,
                }">{{ item.name }}</li>
            </RouterLink>
        </ul>
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

h2 {
    margin: 0;
    margin-left: 10px;
    margin-top: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #6b6a6a;
    cursor: default;
}
</style>