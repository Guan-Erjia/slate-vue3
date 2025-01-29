<script setup lang="ts">
import RichTextExample from './pages/richtext/index.vue';
import Checklists from './pages/check-lists/index.vue';
import EditableVoids from './pages/editable-voids/index.vue';
import Embeds from './pages/embeds/index.vue';
</script>

<template>
  <header class="header">
    <span>Slate Examples</span>
    <div style="flex-grow: 1;min-width: 0;"></div>
    <a href="https://github.com/Guan-Erjia/slate-vue3" target="_blank">GitHub</a>
  </header>
  <div style="display: flex;height: calc(100% - 50px);">
    <ol class="nav-list">
      <a href="#RichText">
        <li class="nav-list-item">Rich Text</li>
        <li class="nav-list-item">Checklists</li>
        <li class="nav-list-item">EditableVoids</li>
      </a>
    </ol>
    <div class="scroll-container">
      <div class="example-item">
        <RichTextExample />
      </div>
      <div class="example-item">
        <Checklists />
      </div>
      <div class="example-item">
        <EditableVoids />
      </div>
      <div class="example-item">
        <Embeds />
      </div>
    </div>
  </div>
</template>
<style>
a {
  color: #aaaaaa;
  text-decoration: none
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

.nav-list {
  width: 160px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.nav-list-item {
  text-decoration: none;
}

.scroll-container {
  min-width: 0;
  flex-grow: 1;
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.example-item {
  padding: 20px;
  box-sizing: border-box;
  background-color: white;
  margin-bottom: 20px;
}
</style>
