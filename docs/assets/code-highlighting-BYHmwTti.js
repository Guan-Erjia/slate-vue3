import{C as e,F as t,L as n,M as r,T as i,V as a,Y as o,_ as s,b as c,g as l,m as u,p as d,v as f,y as p}from"./index-B4PdPbZL.js";import{t as m}from"./prism-DSDILRsn.js";import{t as h}from"./use-inherit-ref-L-60QVCB.js";import{a as g,c as _,f as v,l as y,r as b,s as x,t as S,v as C}from"./slate-vue-Bn_6_H5a.js";import{n as w}from"./index.es-PHov_ONW.js";import{t as T}from"./Toolbar-LeA4-3DC.js";import{t as E}from"./Button-D-wF4HkQ.js";import{t as D}from"./normalize-tokens-FLuXRL-J.js";var O=[`value`],k=c({__name:`LanguageSelect`,props:{value:{}},emits:[`onChange`],setup(e,{emit:a}){let c=e,u=a,f=e=>{u(`onChange`,e)},p=n();return(e,n)=>(r(),l(`code`,i(o(p),{style:{"font-size":`16px`,"line-height":`20px`,"margin-top":`0`,"background-color":`rgba(0, 20, 60, 0.03)`,padding:`5px 13px`,position:`relative`,display:`block`},spellcheck:!1}),[d(`select`,{"data-testid":`language-select`,value:c.value,contenteditable:!1,style:{position:`absolute`,right:`5px`,top:`5px`,"z-index":`1`},onChange:f},[...n[0]||=[s(`<option value="css">CSS</option><option value="html">HTML</option><option value="java">Java</option><option value="javascript">JavaScript</option><option value="jsx">JSX</option><option value="markdown">Markdown</option><option value="php">PHP</option><option value="python">Python</option><option value="sql">SQL</option><option value="tsx">TSX</option><option value="typescript">TypeScript</option>`,11)]],40,O),t(e.$slots,`default`)],16))}}),A=x(),j=c({__name:`index`,setup(t){let n=e=>e.split(`
`).map(e=>({type:`code-line`,children:[{text:e}]})),i=[{type:`paragraph`,children:[{text:`Here's one containing a single paragraph block with some text in it:`}]},{type:`code-block`,language:`jsx`,children:n(`// Add the initial value.
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
}`)},{type:`paragraph`,children:[{text:`If you are using TypeScript, you will also need to extend the Editor with ReactEditor and add annotations as per the documentation on TypeScript. The example below also includes the custom types required for the rest of this example.`}]},{type:`code-block`,language:`typescript`,children:n(`// TypeScript users only add this code
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
}`)},{type:`paragraph`,children:[{text:`There you have it!`}]}],s=w(S());s.children=i;let c=t=>{let{attributes:n,children:r,leaf:i}=t,{text:a,...o}=i;return e(`span`,{...n,class:Object.keys(o).join(` `)},r)},l=({attributes:t,children:n,element:r})=>r.type===`code-block`?e(k,{value:r.language,onChange:e=>{let t=_.findPath(s,r);C.setNodes(s,{language:e.target.value},{at:t})},...h(t)},()=>n):r.type===`code-line`?e(`div`,{...t,style:{position:`relative`}},n):e(s.isInline(r)?`span`:`div`,{...t,style:{position:`relative`}},n),d=e=>{(0,A.isHotkey)(`tab`,e)&&(e.preventDefault(),y.insertText(s,`  `))},x=([e])=>{let t=new WeakMap,n=y.nodes(s,{at:[],mode:`highest`,match:e=>v.isElement(e)&&e.type===`code-block`});return Array.from(n).forEach(([e,n])=>{let r=e.children.map(e=>v.string(e)).join(`
`),i=m.tokenize(r,m.languages[e.language]);D(i).forEach((r,i)=>{let a=e.children[i];t.has(a)||t.set(a,[]);let o=0;r.forEach(e=>{let r=e.content.length;if(!r)return;let s=o+r,c=[...n,i,0],l={anchor:{path:c,offset:o},focus:{path:c,offset:s},token:!0,...Object.fromEntries(e.types.map(e=>[e,!0]))};t.get(a).push(l),o=s})})}),v.isElement(e)&&e.type===`code-line`?t.get(e):[]},O=()=>{C.wrapNodes(s,{type:`code-block`,language:`html`,children:[]},{match:e=>v.isElement(e)&&e.type===`paragraph`,split:!0}),C.setNodes(s,{type:`code-line`},{match:e=>v.isElement(e)&&e.type===`paragraph`})},j=e=>{e.preventDefault()};return(e,t)=>(r(),u(o(g),{editor:o(s),"render-element":l,"render-leaf":c,decorate:x},{default:a(()=>[p(T,null,{default:a(()=>[p(E,{"data-testid":`code-block-button`,active:``,onClick:O,onPointerdown:j},{default:a(()=>[...t[0]||=[f(` code `,-1)]]),_:1})]),_:1}),p(o(b),{class:`code-hightlighting`,placeholder:`Enter some text...`,onKeydown:d})]),_:1},8,[`editor`]))}});export{j as default};