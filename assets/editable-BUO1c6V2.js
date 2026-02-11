import{_ as e}from"./Markdown.vue_vue_type_style_index_0_lang-Bt8qSoBJ.js";import{d as n,f as t,e as o,o as a}from"./index-cO_khfoC.js";import"./editable-OBw7MXqz.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-6lEOFIKA.js";import"./normalize-tokens-eYXBy0v-.js";const l=`# Editable

\`Editable\` Create a real DOM root node, where the core logic of slate and user interaction is implemented.

> This component collects user operations and maps them to the slate

\`\`\`typescript
interface EditableProps {
  readOnly: boolean;
  placeholder: string;
  scrollSelectionIntoView: (
    editor: DOMEditor,
    domRange: globalThis.Range
  ) => void;
  autoFocus: boolean
}
\`\`\`


## readOnly

Prevent editing when set to \`true\`

## placeholder

Placeholder text when the editor is **empty**

## scrollSelectionIntoView

Replace the default behavior of \`scrollSelectionIntoView\`

## autoFocus

Autofocus when editor is \`mounted\`

## Event Listener

You can add event listeners at this node to override the internal behavior of \`Editable\` components

\`\`\`html
<script setup lang="ts">
  const handleClick = () => {
    alert("clicked"!);
  };
<\/script>
<template>
  <Slate :editor>
    <Editable @click="handleClick" />
  </Slate>
</template>
\`\`\`
`,f=n({__name:"editable",setup(i){return(r,c)=>(a(),t(e,{content:o(l)},null,8,["content"]))}});export{f as default};
