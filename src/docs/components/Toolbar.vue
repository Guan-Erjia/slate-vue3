<template>
  <Menu v-bind="attrs" class="menu">
    <slot></slot>
  </Menu>
</template>

<script lang="ts" setup>
import Menu from './Menu.vue'
import { useAttrs } from 'vue';

const attrs = useAttrs()

</script>
<style scoped>
.menu {
  position: relative;
  padding: 1px 18px 17px;
  margin: 0 -20px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
}
</style>