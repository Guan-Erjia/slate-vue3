<script setup lang="ts">
import RichText from './pages/richtext/index.vue';
import CheckLists from './pages/check-lists/index.vue';
import EditableVoids from './pages/editable-voids/index.vue';
import Embeds from './pages/embeds/index.vue';
import { computed } from 'vue';

const ExampleOptions = computed(() => [
  {
    name: 'rich-text',
    component: RichText,
  },
  {
    name: 'check-lists',
    component: CheckLists,
  },
  {
    name: 'editable-voids',
    component: EditableVoids,
  },
  {
    name: 'embeds',
    component: Embeds,
  }
])
</script>

<template>
  <header class="header">
    <span>Slate Examples</span>
    <div style="flex-grow: 1;min-width: 0;"></div>
    <a href="https://github.com/Guan-Erjia/slate-vue3" target="_blank">GitHub</a>
  </header>
  <div style="display: flex;height: calc(100% - 50px);">
    <ol style="width: 160px;flex-shrink: 0;box-sizing: border-box;">
      <a :href="`#${item.name}`" v-for="item in ExampleOptions">
        <li style="text-decoration: none;margin-bottom: 10px;">{{ item.name }}</li>
      </a>
    </ol>
    <div class="scroll-container">
      <template v-for="item in ExampleOptions">
        <header style="display: flex; padding-top: 20px;" :id="item.name">
          <span style="cursor: default;font-size: 18px;"> {{ item.name }} </span>
          <div style="flex-grow: 1;"></div>
          <a target="_blank"
            :href="`https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/docs/pages/${item.name}`">
            view code</a>
        </header>
        <div style="padding: 20px;margin-top: 10px;box-sizing: border-box;background-color: white;">
          <component :is="item.component" />
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped>
a {
  color: gray;
  text-decoration: none
}

a:hover {
  color: #aaaaaa;
}

.header {
  box-sizing: border-box;
  padding: 0 20px;
  background-color: black;
  display: flex;
  width: 100%;
  color: #aaaaaa;
  height: 50px;
  align-items: center;
}

.scroll-container {
  min-width: 0;
  flex-grow: 1;
  padding: 0 20px 20px 20px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
