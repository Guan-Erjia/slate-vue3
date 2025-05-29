import{_ as e}from"./Markdown.vue_vue_type_style_index_0_lang-BZweINEm.js";import{d as n,f as t,e as o,o as r}from"./index-xHOZleg_.js";import"./editable-qdC9aCYK.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-BHPC-1In.js";import"./normalize-tokens-Bcdb6Sh1.js";const i=`# Editable

\`Editable\` Create a real DOM root node, where the core logic of slate and user interaction is implemented.

> This component collects user operations and maps them to the slate

\`\`\`typescript
interface EditableProps extends HTMLAttributes {
  role?: string;
  readOnly: boolean;
  placeholder?: string;
  style?: CSSProperties;
  scrollSelectionIntoView: (
    editor: DOMEditor,
    domRange: globalThis.Range
  ) => void;
  is: string;
}
\`\`\`

## role

Same as the \`role\` attribute of HTML

## readOnly

Prevent editing when set to \`true\`

## placeholder

Placeholder text when the editor is **empty**

## scrollSelectionIntoView

Replace the default behavior of \`scrollSelectionIntoView\`

## style

Overwrite the default \`style\`

## is

Define the \`HTML\` tags for rendering the root node

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
`,u=n({__name:"editable",setup(l){return(a,s)=>(r(),t(e,{content:o(i)},null,8,["content"]))}});export{u as default};
