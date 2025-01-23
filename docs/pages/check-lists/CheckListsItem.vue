<template>
    <div style=" display: flex;
        flex-direction: row;
        align-items: center;" v-bind="attrs">
        <span :contentEditable="false" style="margin-right:12px;">
            <input type="checkbox" :checked="checked" @change="onChange" />
        </span>
        <span :contentEditable="!readOnly" suppressContentEditableWarning style="flex: 1" :style="{
            opacity: checked ? 0.666 : 1,
            textDecoration: !checked ? 'none' : 'line-through'
        }">
            <slot></slot>
        </span>
    </div>
</template>

<script lang="ts" setup>
import { Element, Transforms } from 'slate';
import { DOMEditor } from 'slate-dom';
import { useEditor, useReadOnly } from 'slate-vue';
import { computed, useAttrs, Events } from 'vue';
const attrs = useAttrs()
const props = defineProps<{
    element: any
}>()
const editor = useEditor()
const readOnly = useReadOnly()
const checked = computed<boolean>(() => props.element?.checked)

const onChange = (event: Events['onChange']) => {
    return
    const path = DOMEditor.findPath(editor, props.element)
    const newProperties: Partial<Element> = {
        checked: (event.target as HTMLInputElement)?.checked,
    }
    Transforms.setNodes(editor, newProperties, { at: path })
    console.log(editor.children)
}
</script>
