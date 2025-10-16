<template>
    <Slate :editor :render-leaf>
        <Editable placeholder="Enter some text…" spellcheck />
    </Slate>
</template>
<script lang="ts" setup>
import { Slate, Editable, RenderLeafProps } from 'slate-vue3';
import { createEditor, Descendant } from 'slate-vue3/core';
import { withDOM } from 'slate-vue3/dom';
import { withHistory } from 'slate-vue3/history';
import { h } from 'vue';

const props = defineProps<{
    value: Descendant[]
}>()

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    if (leaf.bold) {
        return h('span', attributes, h('strong', children))
    }
    return h('span', attributes, children)
}
const editor = withHistory(withDOM(createEditor()))
editor.children = props.value
</script>
