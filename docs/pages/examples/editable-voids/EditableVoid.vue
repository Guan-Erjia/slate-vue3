<template>
  <div :contenteditable="false" v-bind="attrs">
    <div
      style="box-shadow: 0 0 0 3px #ddd; padding: 8px"
      :contenteditable="false"
    >
      <h4>Name:</h4>
      <input style="margin: 8px 0" type="text" v-model="inputValue" />
      <h4>Left or right handed:</h4>
      <input style="width: unset" type="radio" name="handedness" value="left" />
      <span style="cursor: default">Left</span>
      <br />
      <input
        style="width: unset"
        type="radio"
        name="handedness"
        value="right"
      />
      <span style="cursor: default">Right</span>
      <h4>Tell us about yourself:</h4>
      <div style="padding: 20px; border: 2px solid #ddd">
        <RichTextEditor />
      </div>
    </div>
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { HTMLAttributes, ref, useAttrs } from "vue";
import RichTextEditor from "../rich-text/index.vue";
const inputValue = ref("");
const attrs: HTMLAttributes = useAttrs();
</script>
