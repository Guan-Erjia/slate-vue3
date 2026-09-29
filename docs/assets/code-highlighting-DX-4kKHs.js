import{c as e,f as t,l as n,o as r,r as i,s as a,t as o,v as s}from"./slate-vue-DNqceksV.js";import{K as c,M as l,P as u,R as d,S as f,_ as p,b as m,g as h,k as g,m as _,p as v,v as y,w as b,y as x}from"./index-ATgPW3p-.js";import{t as S}from"./use-inherit-ref-Co1t3mKs.js";import{t as C}from"./index.es-BeUHC4bq.js";import{t as w}from"./prism-yQ_7E2IA.js";import{t as T}from"./normalize-tokens-FLuXRL-J.js";import{t as E}from"./Toolbar-CEMGYPV0.js";import{t as D}from"./Button-DcDJHUts.js";var O=[`value`],k=m({__name:`LanguageSelect`,props:{value:{}},emits:[`onChange`],setup(e,{emit:t}){let n=e,r=t,i=e=>{r(`onChange`,e)},a=u();return(e,t)=>(g(),h(`code`,b(c(a),{style:{"font-size":`16px`,"line-height":`20px`,"margin-top":`0`,"background-color":`rgba(0, 20, 60, 0.03)`,padding:`5px 13px`,position:`relative`,display:`block`},spellcheck:!1}),[v(`select`,{"data-testid":`language-select`,value:n.value,contenteditable:!1,style:{position:`absolute`,right:`5px`,top:`5px`,"z-index":`1`},onChange:i},[...t[0]||=[p(`<option value="css">CSS</option><option value="html">HTML</option><option value="java">Java</option><option value="javascript">JavaScript</option><option value="jsx">JSX</option><option value="markdown">Markdown</option><option value="php">PHP</option><option value="python">Python</option><option value="sql">SQL</option><option value="tsx">TSX</option><option value="typescript">TypeScript</option>`,11)]],40,O),l(e.$slots,`default`)],16))}}),A=a(),j=m({__name:`index`,setup(a){let l=e=>e.split(`
`).map(e=>({type:`code-line`,children:[{text:e}]})),u=[{type:`paragraph`,children:[{text:`Here's one containing a single paragraph block with some text in it:`}]},{type:`code-block`,language:`jsx`,children:l(`// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

const App = () => {
  const editor = createReactiveEditor()
  editor.children = initialValue

  return (
    <Slate editor={editor}>
      <Editable />
    </Slate>
  )
}`)},{type:`paragraph`,children:[{text:`If you are using TypeScript, you will also need to extend the Editor with ReactEditor and add annotations as per the documentation on TypeScript. The example below also includes the custom types required for the rest of this example.`}]},{type:`code-block`,language:`typescript`,children:l(`// TypeScript users only add this code
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
}`)},{type:`paragraph`,children:[{text:`There you have it!`}]}],p=C(o());p.children=u;let m=e=>{let{attributes:t,children:n,leaf:r}=e,{text:i,...a}=r;return f(`span`,{...t,class:Object.keys(a).join(` `)},n)},h=({attributes:t,children:n,element:r})=>r.type===`code-block`?f(k,{value:r.language,onChange:t=>{let n=e.findPath(p,r);s.setNodes(p,{language:t.target.value},{at:n})},...S(t)},()=>n):r.type===`code-line`?f(`div`,{...t,style:{position:`relative`}},n):f(p.isInline(r)?`span`:`div`,{...t,style:{position:`relative`}},n),v=e=>{(0,A.isHotkey)(`tab`,e)&&(e.preventDefault(),n.insertText(p,`  `))},b=([e])=>{let r=new WeakMap,i=n.nodes(p,{at:[],mode:`highest`,match:e=>t.isElement(e)&&e.type===`code-block`});return Array.from(i).forEach(([e,n])=>{let i=e.children.map(e=>t.string(e)).join(`
`),a=w.tokenize(i,w.languages[e.language]);T(a).forEach((t,i)=>{let a=e.children[i];r.has(a)||r.set(a,[]);let o=0;t.forEach(e=>{let t=e.content.length;if(!t)return;let s=o+t,c=[...n,i,0],l={anchor:{path:c,offset:o},focus:{path:c,offset:s},token:!0,...Object.fromEntries(e.types.map(e=>[e,!0]))};r.get(a).push(l),o=s})})}),t.isElement(e)&&e.type===`code-line`?r.get(e):[]},O=()=>{s.wrapNodes(p,{type:`code-block`,language:`html`,children:[]},{match:e=>t.isElement(e)&&e.type===`paragraph`,split:!0}),s.setNodes(p,{type:`code-line`},{match:e=>t.isElement(e)&&e.type===`paragraph`})},j=e=>{e.preventDefault()};return(e,t)=>(g(),_(c(r),{editor:c(p),"render-element":h,"render-leaf":m,decorate:b},{default:d(()=>[x(E,null,{default:d(()=>[x(D,{"data-testid":`code-block-button`,active:``,onClick:O,onPointerdown:j},{default:d(()=>[...t[0]||=[y(` code `,-1)]]),_:1})]),_:1}),x(c(i),{class:`code-hightlighting`,placeholder:`Enter some text...`,onKeydown:v})]),_:1},8,[`editor`]))}});export{j as default};