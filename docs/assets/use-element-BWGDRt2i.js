import{_ as e}from"./Markdown.vue_vue_type_style_index_0_lang-CCYovVqY.js";import{d as n,f as t,e as o,o as s}from"./index-BaTPW1Q7.js";import"./editable-BP25KW3f.js";import"./use-inherit-ref-lmEEbD6_.js";import"./prism-markdown-DoSp7Rzy.js";import"./normalize-tokens-eYXBy0v-.js";const m=`> Get the current element object. Re-renders whenever the element or any of its descendants changes.

\`\`\`typescript
import { useElement } from "slate-vue3";

const useElement: () =>  ComputedRef<Element>;

const element = useElement();
\`\`\`
  
  
  
> The same as useElement() but returns null instead of throwing an error when not inside an element.
\`\`\`typescript
import { useElementIf } from "slate-vue3";

const useElementIf: () =>  ComputedRef<Element | null>;

const elementIf = useElementIf();
\`\`\`
`,d=n({__name:"use-element",setup(r){return(l,c)=>(s(),t(e,{content:o(m)},null,8,["content"]))}});export{d as default};
