import{M as e,Y as t,b as n,m as r}from"./index-B4PdPbZL.js";import{t as i}from"./Markdown-Ckmv7lzu.js";var a=`> Get the current element object. Re-renders whenever the element or any of its descendants changes.

\`\`\`typescript
import { useElementProps } from "slate-vue3";

const useElementProps: () => Element;

const element = useElementProps();
\`\`\`

> The same as useElementProps() but returns null instead of throwing an error when not inside an element.

\`\`\`typescript
import { useElementPropsIf } from "slate-vue3";

const useElementPropsIf: () => { element: Element | null };

const elementIf = useElementPropsIf();
\`\`\`
`,o=n({__name:`use-element`,setup(n){return(n,o)=>(e(),r(i,{content:t(a)},null,8,[`content`]))}});export{o as default};