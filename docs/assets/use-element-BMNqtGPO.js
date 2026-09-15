import{G as e,O as t,p as n,y as r}from"./index-BGFTbDc-.js";import{t as i}from"./Markdown-CHTbvHW3.js";var a=`> Get the current element object. Re-renders whenever the element or any of its descendants changes.

\`\`\`typescript
import { useElement } from "slate-vue3";

const useElement: () => Element;

const element = useElement();
\`\`\`
  
  
  
> The same as useElement() but returns null instead of throwing an error when not inside an element.
\`\`\`typescript
import { useElementIf } from "slate-vue3";

const useElementIf: () => Element | null;

const elementIf = useElementIf();
\`\`\`
`,o=r({__name:`use-element`,setup(r){return(r,o)=>(t(),n(i,{content:e(a)},null,8,[`content`]))}});export{o as default};