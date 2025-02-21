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
import { withDOM, Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withHistory } from "slate-vue3"
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
1. :sparkles: Highly customizable features, use slate core at the bottom level  
2. :zap: The latest version of the core, use vue internal response implementation to reduce the number of re-renderings  
3. :coffee: This library provides the same usage as slate-react, design tends to be stable

# Hooks
## [useComposing](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-composing.ts)
> Get the current composing state of the editor. It deals with compositionstart, compositionupdate, compositionend events.

const useComposing : ( ) => Ref<boolean>
```
import { useComposing } from 'slate-vue3'

const composing = useComposing()
```

## [useFocused](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-focus.ts)
> Get the current focused state of the editor.

const useFocused : ( ) => Ref<boolean>
```
import { useFocused } from 'slate-vue3'

const focused = useFocused()
```

## [useReadOnly](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-read-only.ts)
> Get the current readOnly state of the editor.

const useReadOnly : ( ) => Ref<boolean>
```
import { useReadOnly } from 'slate-vue3'

const readonly = useReadOnly()
```

## [useSelected](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selected.ts)
> Get the current selected state of an element.

const useSelected : ( ) => ComputedRef<boolean>
```
import { useSelected } from 'slate-vue3'

const selected = useSelected()
```

## [useEditor](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-editor.ts)
> Get the current editor object from the context. Context whenever changes occur in the editor.

const useEditor : ( ) => Editor
```
import { useEditor } from 'slate-vue3'

const editor = useEditor()
```

## [useSelection](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selection.ts)
> Get the current editor selection from the context.

const useSelection : ( ) => ComputedRef<Selection>
```
import { useSelection } from 'slate-vue3'

const selection = useSelection()
```


## [useInheritRef](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-inherit-ref.ts)
> Automatically bind ref to the real node when the component is mounted，This is important when rendering element nodes directly

const useInheritRef : ( attribute: HTMLAttributes ) => HTMLAttributes
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

# FAQ
## 1. Why do I have to pass renderFunction into <Slate /> component ?
This ensures that your rich text is as expected, and slave-vue3 provides some default rendering functions, you can directly use the default rendering behavior

## 2. Can i use jsx in slate-vue3 ?
Of coures yes, but we do not recommend it unless you have already configured jsx in the project, as a branch, using the h function directly is already simple enough

## 3. Why do rendering functions not use Vue components ?
Vue uses lazy updates, rendering with components generates additional state, which can cause unexpected results during updates, it would be better to use functions as branches directly

# Directory Structure

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

# Compact Slate

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