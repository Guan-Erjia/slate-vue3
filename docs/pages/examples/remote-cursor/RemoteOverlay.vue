<template>
  <div :className="attributes.className" ref="containerRef">
    <slot></slot>
    <template v-for="cursor in cursors">
      <div v-for="(position, index) in cursor.selectionRects" :style="{
        position: 'absolute',
        backgroundColor: addAlpha(cursor.data?.color || 'red', 0.5),
        cursor: 'none',
        ...position
      }" :key="index" />
      <div v-if="cursor.caretPosition && cursor.data" :style="{
        ...cursor.caretPosition,
        background: cursor.data.color,
        width: '2px',
        position: 'absolute'
      }">
        <div :style="{
          transform: 'translateY(-100%)',
          background: cursor.data.color,
          position: 'absolute',
          fontSize: '14px',
          color: 'white',
          whiteSpace: 'nowrap',
          top: 0,
          borderRadius: '12px',
          borderBottomLeftRadius: '0px',
          padding: '6px 2px'
        }">
          {{ cursor.data.name }}
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useRemoteCursorOverlayPositions } from 'slate-vue3/yjs';
import { ref, useAttrs } from 'vue';
const attributes = useAttrs()
const containerRef = ref()

const [cursors] = useRemoteCursorOverlayPositions<{
  name: string;
  color: string;
}>({
  containerRef,
});

setInterval(() => {
  console.log(cursors.value)
}, 2000);

function addAlpha(hexColor: string, opacity: number): string {
  const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  return hexColor + normalized.toString(16).toUpperCase();
}
</script>