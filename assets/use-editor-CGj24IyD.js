import{_ as t}from"./Markdown.vue_vue_type_style_index_0_lang-DGn8TVIP.js";import{d as e,f as n,e as o,o as r}from"./index-DiO5Ujga.js";import"./editable-DBisfPri.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-CJ8r62iD.js";import"./normalize-tokens-eYXBy0v-.js";const i=`> Get the current editor object from the context, the returned result is a proxy object

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
