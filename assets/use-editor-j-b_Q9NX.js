import{_ as t}from"./Markdown.vue_vue_type_style_index_0_lang-CV5N9A0A.js";import{d as e,f as n,e as o,o as r}from"./index-CFI11kLf.js";import"./editable-3R3-iUPg.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-Nq6lbcwn.js";import"./normalize-tokens-Bcdb6Sh1.js";const i=`> Get the current editor object from the context, the returned result is a proxy object

\`\`\`typescript
import { useEditor } from "slate-vue3";

const useEditor: () => DOMEditor;

const editor = useEditor();
\`\`\`

> Get the current editor raw object from the context, it won't trigger rerender when children and selection change

\`\`\`typescript
import { useEditorStatic } from "slate-vue3";

const useEditorStatic: () => DOMEditor;

const staticEditor = useEditorStatic();
\`\`\``,l=e({__name:"use-editor",setup(c){return(s,a)=>(r(),n(t,{content:o(i)},null,8,["content"]))}});export{l as default};
