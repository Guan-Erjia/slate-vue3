[<img src="https://raw.githubusercontent.com/ianstormtaylor/slate/main/docs/images/banner.png" />](https://github.com/ianstormtaylor/slate/raw/main/docs/images/banner.png)

<p align="center">
  slate-<a style="color: #087ea4" href="https://react.dev/">react</a> library implemented with <a style="color: #42b883" href="https://vuejs.org/">vue3</a>
</p>
<br/>

# How to use?

## 1. install slate-vue3
```
npm install slate-vue3
```
## 2. now, you can use it in vue-sfc
```
<script setup lang="ts">
import { withDOM, Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withHistory } from "slate-vue"
import { h } from "vue";

const initialValue: Descendant[] = [{
  type: 'paragraph',
  children: [{ text: 'Let's start' }],
}]
const renderElement = ({ attributes, children }) => h('p', attributes, children)
const editor = withHistory(withDOM(createEditor(initialValue)))
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable />
  </Slate>
</template>
```
## 3. check out the [**live demo**](https://guan-erjia.github.io/slate-vue3/) of all of the examples
![example](https://guan-erjia.github.io/slate-vue3/example.png)

# Why use it?
1. The most comprehensive rich text feature customization, following slate-react
2. Use vue internal response implementation to reduce the number of re-renderings
3. You can easily use vue-devtools to debug in a vue project
4. This library provides the same usage as slate-react

# Hooks
## [useComposing](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-composing.ts)
const useComposing : ( ) => Ref<boolean>
```
import { useComposing } from 'slate-vue'

const composing = useComposing()
```
> Get the current composing state of the editor. It deals with compositionstart, compositionupdate, compositionend events.

## [useFocused](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-focus.ts)
const useFocused : ( ) => Ref<boolean>
```
import { useFocused } from 'slate-vue'

const focused = useFocused()
```
> Get the current focused state of the editor.  

## [useReadOnly](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-read-only.ts)
const useReadOnly : ( ) => Ref<boolean>
```
import { useReadOnly } from 'slate-vue'

const readonly = useReadOnly()
```
> Get the current readOnly state of the editor.

## [useSelected](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selected.ts)
const useSelected : ( ) => ComputedRef<boolean>
```
import { useSelected } from 'slate-vue'

const selected = useSelected()
```
> Get the current selected state of an element.

## [useEditor](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-editor.ts)
const useEditor : ( ) => Editor
```
import { useEditor } from 'slate-vue'

const editor = useEditor()
```
> Get the current editor object from the context. Context whenever changes occur in the editor.

## [useSelection](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selection.ts)
const useSelection : ( ) => ComputedRef<Selection>
```
import { useSelection } from 'slate-vue'

const selection = useSelection()
```
> Get the current editor selection from the context.


## [useInheritRef](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-inherit-ref.ts)
const useInheritRef : ( attr: HTMLAttribute ) => HTMLAttribute
```
const renderElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'image':
      return h(ImageComp, { element, ...useInheritRef(attributes) }, () => children)
    default:
      return h('p', attributes, children)
  }
}
```
> Automatically bind ref to the real node when the component is mounted，This is important when rendering element nodes directly

# Packages

- [slate](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/slate)
  slate core logic, update synchronously with slate
- [slate-dom](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/slate-dom)
  Implementation of slate on dom, update synchronously with slate-dom
- [slate-vue](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/slate-vue)
  Vue components for rendering slate editors
- [slate-history](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/slate-history)
  Provide undo redo functions, replace Weakmap to UnProxyWeakmap
- [share-tools](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/share-tools)
  for special processing of Proxy data, obtain the raw pointer, isPlainObject declare

# compact files of slate

**reactive implement**

1. packages/slate/src/interfaces/text.ts 115:115
2. packages/slate/src/create-editor.ts 94:94
3. packages/slate/src/transforms-node/set-nodes.ts 18:18
4. packages/slate/src/interfaces/text.ts 116:116

**remove immer**

1. packages/slate/src/interfaces/node.ts 365:365
2. packages/slate/src/interfaces/point.ts 103:103
3. packages/slate/src/interfaces/range.ts 224:224
4. packages/slate/src/interfaces/transforms/general.ts 322:333

**rewrite implement for WeakMap**

1. packages/share-tools/index.ts
2. packages/slate-dom/src/utils/weak-maps.ts

**import types from globalThis in slate-dom**

1. packages/slate-dom/src/index.ts
2. packages/slate-dom/src/plugin/dom-editor.ts
3. packages/slate-dom/src/utils/dom.ts

**other compact**

1. packages/slate/src/core/normalize-node.ts
2. packages/slate-dom/src/plugin/dom-editor.ts 421:441