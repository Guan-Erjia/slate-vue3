<template>
  <div v-bind="attrs">
    <slot></slot>
    <div :contenteditable="false" style="position: relative;">
      <img :src="props.element.url" style="display: block; max-width: 100%; max-height: 10em;"
        :style="{ boxShadow: `${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'}` }" />
      <Button active @click="onClickButton" style="position: absolute; top: 0.5em; left: 0.5em; background-color: white"
        :style="{ display: `${selected && focused ? 'inline' : 'none'}` }">
        delete
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImageElement } from '../../../custom-types';
import { useFocused, useSelected, useEditor, } from 'slate-vue3';
import Button from '../../../components/Button.vue'
import { HTMLAttributes, useAttrs } from 'vue';
import { DOMEditor } from 'slate-vue3/dom';
import { Transforms } from 'slate-vue3/core';
const props = defineProps<{
  element: ImageElement
}>()

const selected = useSelected()
const focused = useFocused()
const editor = useEditor()
const onClickButton = () => {
  Transforms.removeNodes(editor, { at: DOMEditor.findPath(editor, props.element) })
}
const attrs: HTMLAttributes = useAttrs()
</script>