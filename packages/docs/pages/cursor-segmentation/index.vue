<script setup lang="ts">
import { Slate, Editable, defaultRenderPlaceHolder, type RenderElementProps, RenderLeafProps } from "slate-vue3"
import { h } from "vue";
import { createEditor, Descendant, NodeEntry, DecoratedRange, Text, Range, Path } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";

const initialValue: Descendant[] = [
    {
        type: 'paragraph',
        children: [
            { text: 'This is editable plain text, just like a <textarea>!' },
        ],
    },
    {
        type: 'paragraph',
        children: [
            { text: 'This is editable plain text, just like a <textarea>!' },
        ],
    },
    {
        type: 'paragraph',
        children: [
            { text: 'This is editable plain text, just like a <textarea>!' },
        ],
    }
]

const renderElement = ({ attributes, children }: RenderElementProps) => h('p', attributes, children)

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => h('span', {
    ...attributes,
    style: {
        backgroundColor: 'highlight' in leaf ? '#ffeeba' : undefined
    }
}, children)

const editor = withHistory(withDOM(createEditor(initialValue)))
const decorate = ([node, path]: NodeEntry): DecoratedRange[] => {
    const ranges: DecoratedRange[] = []
    if (Array.isArray(node.children) && node.children.every(Text.isText) && editor.selection) {
        const offset = node.children[0].text.length
        if (Path.isCommon(path, editor.selection.focus.path)) {
            ranges.push({
                anchor: { path, offset: editor.selection.focus.offset },
                focus: { path, offset },
                highlight: true,
            })
        }
        if (Path.isAfter(path, editor.selection.focus.path)) {
            ranges.push({
                anchor: { path, offset: 0 },
                focus: { path, offset },
                highlight: true,
            })
        }
    }
    return ranges
}
</script>

<template>
    <Slate :editor="editor" :render-element="renderElement" :render-leaf="renderLeaf" :decorate="decorate"
        :render-placeholder="defaultRenderPlaceHolder">
        <Editable placeholder="Enter some plain text..." />
    </Slate>
</template>
