import{_ as e,c as t,d as n,h as r,i,l as a,n as o,o as s,s as c,u as l}from"./slate-vue-DaKWDKju.js";import{A as u,D as d,L as f,S as p,T as m,_ as h,a as g,c as _,d as v,f as y,h as b,i as x,o as S,p as C,u as w}from"./runtime-core.esm-bundler-CmM2dv3X.js";import{t as T}from"./use-inherit-ref-Co1t3mKs.js";import{t as E}from"./slate-history-qJEXi9rO.js";import{t as D}from"./prism-Dh8dFAdT.js";import{t as O}from"./normalize-tokens-FLuXRL-J.js";import{t as k}from"./Toolbar-DKoDSwvV.js";import{t as A}from"./Button-DAnMBXoe.js";var j=[`value`],M=C({__name:`LanguageSelect`,props:{value:{}},emits:[`onChange`],setup(e,{emit:t}){let n=e,r=t,i=e=>{r(`onChange`,e)},a=d();return(e,t)=>(p(),_(`code`,h(f(a),{style:{"font-size":`16px`,"line-height":`20px`,"margin-top":`0`,"background-color":`rgba(0, 20, 60, 0.03)`,padding:`5px 13px`,position:`relative`,display:`block`},spellcheck:!1}),[g(`select`,{"data-testid":`language-select`,value:n.value,contenteditable:!1,style:{position:`absolute`,right:`5px`,top:`5px`,"z-index":`1`},onChange:i},[...t[0]||=[w(`<option value="css">CSS</option><option value="html">HTML</option><option value="java">Java</option><option value="javascript">JavaScript</option><option value="jsx">JSX</option><option value="markdown">Markdown</option><option value="php">PHP</option><option value="python">Python</option><option value="sql">SQL</option><option value="tsx">TSX</option><option value="typescript">TypeScript</option>`,11)]],40,j),m(e.$slots,`default`)],16))}}),N=s(),P=C({__name:`index`,setup(s){let d=e=>e.split(`
`).map(e=>({type:`code-line`,children:[{text:e}]})),m=[{type:`paragraph`,children:[{text:`Here's one containing a single paragraph block with some text in it:`}]},{type:`code-block`,language:`jsx`,children:d(`// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

const App = () => {
  const editor = withDOM(createEditor())
  editor.children = initialValue

  return (
    <Slate editor={editor}>
      <Editable />
    </Slate>
  )
}`)},{type:`paragraph`,children:[{text:`If you are using TypeScript, you will also need to extend the Editor with ReactEditor and add annotations as per the documentation on TypeScript. The example below also includes the custom types required for the rest of this example.`}]},{type:`code-block`,language:`typescript`,children:d(`// TypeScript users only add this code
import { BaseEditor, Descendant } from 'slate-vue3/core'
import { DOMEditor } from 'slate-vue3/dom'

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & DOMEditor
    Element: CustomElement
    Text: CustomText
  }
}`)},{type:`paragraph`,children:[{text:`There you have it!`}]}],h=E(c(l()));h.children=m;let g=e=>{let{attributes:t,children:n,leaf:r}=e,{text:i,...a}=r;return b(`span`,{...t,class:Object.keys(a).join(` `)},n)},_=({attributes:e,children:r,element:i})=>i.type===`code-block`?b(M,{value:i.language,onChange:e=>{let r=t.findPath(h,i);n.setNodes(h,{language:e.target.value},{at:r})},...T(e)},()=>r):i.type===`code-line`?b(`div`,{...e,style:{position:`relative`}},r):b(h.isInline(i)?`span`:`div`,{...e,style:{position:`relative`}},r),C=e=>{(0,N.isHotkey)(`tab`,e)&&(e.preventDefault(),r.insertText(h,`  `))},w=x(()=>{let t=new a,n=r.nodes(h,{at:[],mode:`highest`,match:t=>e.isElement(t)&&t.type===`code-block`});return Array.from(n).forEach(([n,r])=>{let i=n.children.map(t=>e.string(t)).join(`
`);O(D.tokenize(i,D.languages[n.language])).forEach((e,i)=>{let a=n.children[i];t.has(a)||t.set(a,[]);let o=0;e.forEach(e=>{let n=e.content.length;if(!n)return;let s=o+n,c=[...r,i,0],l={anchor:{path:c,offset:o},focus:{path:c,offset:s},token:!0,...Object.fromEntries(e.types.map(e=>[e,!0]))};t.get(a).push(l),o=s})})}),t}),j=([t])=>e.isElement(t)&&t.type===`code-line`?w.value.get(t):[],P=()=>{n.wrapNodes(h,{type:`code-block`,language:`html`,children:[]},{match:t=>e.isElement(t)&&t.type===`paragraph`,split:!0}),n.setNodes(h,{type:`code-line`},{match:t=>e.isElement(t)&&t.type===`paragraph`})},F=e=>{e.preventDefault()};return(e,t)=>(p(),S(f(i),{editor:f(h),"render-element":_,"render-leaf":g,decorate:j},{default:u(()=>[y(k,null,{default:u(()=>[y(A,{"data-testid":`code-block-button`,active:``,onClick:P,onPointerdown:F},{default:u(()=>[...t[0]||=[v(` code `,-1)]]),_:1})]),_:1}),y(f(o),{class:`code-hightlighting`,placeholder:`Enter some text...`,onKeydown:C})]),_:1},8,[`editor`]))}});export{P as default};