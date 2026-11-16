<template>
  <div ref="overlay" style="position: relative">
    <slot />
    <template v-for="(cursor, index) in cursors" :key="index">
      <div
        class="selection"
        v-for="(position, index) in cursor.selectionRects"
        :style="{
          height: position.height + 'px',
          top: position.top + 'px',
          left: position.left + 'px',
          width: position.width + 'px',
          backgroundColor: addAlpha(cursor.data!.color, 0.5),
        }"
        :key="index"
      />

      <div
        class="cursor"
        v-if="cursor.caretPosition && cursor.data"
        :style="{
          height: cursor.caretPosition.height + 'px',
          top: cursor.caretPosition.top + 'px',
          left: cursor.caretPosition.left + 'px',
        }"
      >
        <div class="label" :style="{ backgroundColor: cursor.data.color }">
          {{ cursor.data.name }}
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useRemoteCursorOverlayPositions } from "slate-vue3/yjs";
import { useTemplateRef } from "vue";
import { addAlpha } from "./fake";

const overlayRef = useTemplateRef<HTMLDivElement>("overlay");
const [cursors] = useRemoteCursorOverlayPositions<{
  name: string;
  color: string;
}>(overlayRef);
</script>

<style scoped>
.cursor {
  background: black;
  width: 2px;
  position: absolute;
}

.label {
  transform: translateY(-100%);
  background: gray;
  position: absolute;
  font-size: 14px;
  color: white;
  white-space: nowrap;
  top: 0;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  padding: 6px 2px;
}

.selection {
  position: absolute;
  background-color: rgba(255, 0, 0, 0.5);
  cursor: none;
}
</style>
