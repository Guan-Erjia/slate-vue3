import{c as e,f as t,l as n,o as r,r as i,s as a,t as o,v as s}from"./slate-vue-CYcfcOoZ.js";import{C as c,G as l,L as u,N as d,O as f,_ as p,f as m,g as h,h as g,j as _,p as v,v as y,x as b,y as x}from"./index-BGFTbDc-.js";import{t as S}from"./use-inherit-ref-Co1t3mKs.js";import{t as C}from"./index.es-B-yagHus.js";import{t as w}from"./prism-DW0q-W5g.js";import{t as T}from"./normalize-tokens-FLuXRL-J.js";import{t as E}from"./Toolbar-CZUOT29c.js";import{t as D}from"./Button-CbGxLdx8.js";var O=[`value`],k=x({__name:`LanguageSelect`,props:{value:{}},emits:[`onChange`],setup(e,{emit:t}){let n=e,r=t,i=e=>{r(`onChange`,e)},a=d();return(e,t)=>(f(),g(`code`,c(l(a),{style:{"font-size":`16px`,"line-height":`20px`,"margin-top":`0`,"background-color":`rgba(0, 20, 60, 0.03)`,padding:`5px 13px`,position:`relative`,display:`block`},spellcheck:!1}),[m(`select`,{"data-testid":`language-select`,value:n.value,contenteditable:!1,style:{position:`absolute`,right:`5px`,top:`5px`,"z-index":`1`},onChange:i},[...t[0]||=[h(`<option value="css">CSS</option><option value="html">HTML</option><option value="java">Java</option><option value="javascript">JavaScript</option><option value="jsx">JSX</option><option value="markdown">Markdown</option><option value="php">PHP</option><option value="python">Python</option><option value="sql">SQL</option><option value="tsx">TSX</option><option value="typescript">TypeScript</option>`,11)]],40,O),_(e.$slots,`default`)],16))}}),A=a(),j=x({__name:`index`,setup(a){let c=e=>e.split(`
`).map(e=>({type:`code-line`,children:[{text:e}]})),d=[{type:`paragraph`,children:[{text:`Here's one containing a single paragraph block with some text in it:`}]},{type:`code-block`,language:`jsx`,children:c(`// Add the initial value.
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
}`)},{type:`paragraph`,children:[{text:`If you are using TypeScript, you will also need to extend the Editor with ReactEditor and add annotations as per the documentation on TypeScript. The example below also includes the custom types required for the rest of this example.`}]},{type:`code-block`,language:`typescript`,children:c(`// TypeScript users only add this code
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
}`)},{type:`paragraph`,children:[{text:`There you have it!`}]}],m=C(o());m.children=d;let h=e=>{let{attributes:t,children:n,leaf:r}=e,{text:i,...a}=r;return b(`span`,{...t,class:Object.keys(a).join(` `)},n)},g=({attributes:t,children:n,element:r})=>r.type===`code-block`?b(k,{value:r.language,onChange:t=>{let n=e.findPath(m,r);s.setNodes(m,{language:t.target.value},{at:n})},...S(t)},()=>n):r.type===`code-line`?b(`div`,{...t,style:{position:`relative`}},n):b(m.isInline(r)?`span`:`div`,{...t,style:{position:`relative`}},n),_=e=>{(0,A.isHotkey)(`tab`,e)&&(e.preventDefault(),n.insertText(m,`  `))},x=([e])=>{let r=new WeakMap,i=n.nodes(m,{at:[],mode:`highest`,match:e=>t.isElement(e)&&e.type===`code-block`});return Array.from(i).forEach(([e,n])=>{let i=e.children.map(e=>t.string(e)).join(`
`),a=w.tokenize(i,w.languages[e.language]);T(a).forEach((t,i)=>{let a=e.children[i];r.has(a)||r.set(a,[]);let o=0;t.forEach(e=>{let t=e.content.length;if(!t)return;let s=o+t,c=[...n,i,0],l={anchor:{path:c,offset:o},focus:{path:c,offset:s},token:!0,...Object.fromEntries(e.types.map(e=>[e,!0]))};r.get(a).push(l),o=s})})}),t.isElement(e)&&e.type===`code-line`?r.get(e):[]},O=()=>{s.wrapNodes(m,{type:`code-block`,language:`html`,children:[]},{match:e=>t.isElement(e)&&e.type===`paragraph`,split:!0}),s.setNodes(m,{type:`code-line`},{match:e=>t.isElement(e)&&e.type===`paragraph`})},j=e=>{e.preventDefault()};return(e,t)=>(f(),v(l(r),{editor:l(m),"render-element":g,"render-leaf":h,decorate:x},{default:u(()=>[y(E,null,{default:u(()=>[y(D,{"data-testid":`code-block-button`,active:``,onClick:O,onPointerdown:j},{default:u(()=>[...t[0]||=[p(` code `,-1)]]),_:1})]),_:1}),y(l(i),{class:`code-hightlighting`,placeholder:`Enter some text...`,onKeydown:_})]),_:1},8,[`editor`]))}});export{j as default};