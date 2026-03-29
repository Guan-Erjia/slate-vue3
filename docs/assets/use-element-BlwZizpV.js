import{L as e,S as t,o as n,p as r}from"./runtime-core.esm-bundler-ebiS_r9Z.js";import{t as i}from"./Markdown-Ckf5t3Y6.js";var a=`> Get the current element object. Re-renders whenever the element or any of its descendants changes.

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
`,o=r({__name:`use-element`,setup(r){return(r,o)=>(t(),n(i,{content:e(a)},null,8,[`content`]))}});export{o as default};