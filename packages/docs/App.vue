<script setup lang="ts">
import RichText from './pages/richtext/index.vue';
import CheckLists from './pages/check-lists/index.vue';
import EditableVoids from './pages/editable-voids/index.vue';
import Embeds from './pages/embeds/index.vue';
import Codehighlighting from './pages/code-highlighting/index.vue';
import ForcedLayout from './pages/forced-layout/index.vue';
import HoveringToolbar from './pages/hovering-toolbar/index.vue';
import HugeDocument from './pages/huge-document/index.vue';
import Image from './pages/image/index.vue';
import Inline from './pages/inline/index.vue';
import MarkdownPreview from './pages/markdown-preview/index.vue';
import MarkdownShortcuts from './pages/markdown-shortcuts/index.vue';
import Emotions from './pages/emotions/index.vue';
import PasteHtml from './pages/paste-html/index.vue'
import PlainText from './pages/plain-text/index.vue'
import ReadOnly from './pages/read-only/index.vue'
import SearchHighlighting from './pages/search-highlighting/index.vue'
import ShadowDom from './pages/shadow-dom/index.vue'
import Styling from './pages/styling/index.vue'
import Tables from './pages/tables/index.vue'
import Iframe from './pages/iframe/index.vue'
import { computed, onMounted } from 'vue';

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
  },
  {
    name: 'code-highlighting',
    component: Codehighlighting,
  },
  {
    name: 'forced-layout',
    component: ForcedLayout,
  },
  {
    name: 'hovering-toolbar',
    component: HoveringToolbar,
  },
  {
    name: 'huge-document',
    component: HugeDocument,
  },
  {
    name: 'image',
    component: Image,
  },
  {
    name: 'inline',
    component: Inline,
  },
  {
    name: 'markdown-preview',
    component: MarkdownPreview,
  },
  {
    name: 'markdown-shortcuts',
    component: MarkdownShortcuts,
  },
  {
    name: 'emotions',
    component: Emotions,
  },
  {
    name: 'paste-html',
    component: PasteHtml
  },
  {
    name: 'plain-text',
    component: PlainText
  },
  {
    name: 'read-only',
    component: ReadOnly
  },
  {
    name: 'search-highlighting',
    component: SearchHighlighting
  },
  {
    name: 'shadow-dom',
    component: ShadowDom,
  },
  {
    name: 'styling',
    component: Styling,
  },
  {
    name: 'tables',
    component: Tables,
  },
  {
    name: 'iframe',
    component: Iframe,
  },
])

onMounted(() => {
  const hash = location.hash
  if (hash) {
    document.querySelector(hash)?.scrollIntoView({
      behavior: 'instant'
    })
  }
})
</script>

<template>
  <header class="header">
    <span>Slate Examples</span>
    <div style="flex-grow: 1;min-width: 0;"></div>
    <a href="https://github.com/Guan-Erjia/slate-vue3" target="_blank">GitHub</a>
  </header>
  <div style="display: flex;height: calc(100% - 50px);">
    <ol style="width: 200px;flex-shrink: 0;box-sizing: border-box;height: calc(100%-32px);overflow-y: auto;">
      <a :href="`#${item.name}`" v-for="item in ExampleOptions">
        <li style="text-decoration: none;margin-bottom: 10px;">{{ item.name }}</li>
      </a>
    </ol>
    <div class="scroll-container">
      <template v-for="item in ExampleOptions">
        <header style="display: flex; padding-top: 20px;" :id="item.name">
          <span style="cursor: default;font-size: 20px;"> {{ item.name }} </span>
          <div style="flex-grow: 1;"></div>
          <a target="_blank"
            :href="`https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/docs/pages/${item.name}`">
            view code</a>
        </header>
        <div style="margin-top: 10px;box-sizing: border-box;background-color: white;position: relative;">
          <component :is="item.component" />
        </div>
      </template>
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
