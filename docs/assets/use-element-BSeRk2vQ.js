import{K as e,b as t,k as n,m as r}from"./index-ATgPW3p-.js";import{t as i}from"./Markdown-C2-tErwB.js";var a=`> Get the current element object. Re-renders whenever the element or any of its descendants changes.

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
`,o=t({__name:`use-element`,setup(t){return(t,o)=>(n(),r(i,{content:e(a)},null,8,[`content`]))}});export{o as default};