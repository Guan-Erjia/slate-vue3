<template>
    <div style="padding: 15px;">
        <header style="display: flex;;">
            <span style="cursor: default;font-size: 20px;"> {{ route.name }} </span>
            <div style="flex-grow: 1;"></div>
            <a target="_blank"
                :href="`https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/docs/pages/examples/${route.path}`">
                view code</a>
        </header>
        <div style="margin-top: 10px; padding: 10px;box-sizing: border-box;background-color: white;position: relative;">
            <RouterView />
        </div>
    </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute()
</script>