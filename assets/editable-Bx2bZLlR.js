import{_ as e}from"./Markdown.vue_vue_type_style_index_0_lang-CkScEDV2.js";import{d as n,f as t,e as o,o as a}from"./index-D5Bz2i5Y.js";import"./editable-BIOO8naU.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-B5UDPWit.js";import"./normalize-tokens-eYXBy0v-.js";const i=`# Editable

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
