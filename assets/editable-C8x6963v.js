import{_ as e}from"./Markdown.vue_vue_type_style_index_0_lang-Ciy6sm4h.js";import{d as n,f as t,e as o,o as a}from"./index-B_o7JXOQ.js";import"./editable-DTMnK7aF.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-DWP7D3oJ.js";import"./normalize-tokens-Bcdb6Sh1.js";const i=`# Editable

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
  <Slate :editor="editor">
    <Editable @click="handleClick" />
  </Slate>
</template>
\`\`\`
`,f=n({__name:"editable",setup(l){return(r,c)=>(a(),t(e,{content:o(i)},null,8,["content"]))}});export{f as default};
