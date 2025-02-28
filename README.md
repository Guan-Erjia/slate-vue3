[<img src="https://github.com/Guan-Erjia/slate-vue3/blob/master/public/banner.png" />](https://github.com/ianstormtaylor/slate)

<p align="center">
  slate-<a style="color: #087ea4" href="https://react.dev/">react</a> library implemented with <a style="color: #42b883" href="https://vuejs.org/">vue3</a>
</p>
<br/>


# Why use it?
1. :sparkles: Highly customizable features, use slate core at the bottom level  
2. :zap: The latest version of the core, use vue to reduce the number of re-renderings  
3. :coffee: This library provides the same usage as slate-react, design tends to be stable
4. :point_right: Check out the [**live demo**](https://guan-erjia.github.io/slate-vue3/) of all of the examples

# How to use?

## 1. Install slate-vue3
```sh
npm install slate-vue3
```
## 2. Now, you can use it in vue-sfc
```vue
<script setup lang="ts">
import { withDOM, Slate, Editable, defaultRenderLeaf, defaultRenderPlaceHolder, createEditor, withHistory } from "slate-vue3"
import { h } from "vue"

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "Let's start"}]
  }
]
const renderElement = ({ attributes, children }) => h("p", attributes, children)
const editor = withHistory(withDOM(createEditor(initialValue)))
</script>

<template>
  <Slate :editor="editor" :render-element="renderElement" :render-leaf="defaultRenderLeaf"
    :render-placeholder="defaultRenderPlaceHolder">
    <Editable />
  </Slate>
</template>
```

# [Component Props](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/utils/interface.ts)
## Slate
### editor
> slate-editor instance, add DOM specific behaviors to the editor
```typescript
const initialValue: Descendant[] = [{
  type: 'paragraph',
  children: [ { text: 'This is editable plain text, just like a <textarea>!' } ]
}]
const editor: DOMEditor = withDOM(createEditor(initialValue))
```

### decorate
> another type of text-level formatting, split text into leaves
```typescript
function (entry: NodeEntry) => DecoratedRange[]
```

### renderElement
> a function used to render a custom component for a specific type of Element node in the Slate.js document model
```typescript
export interface RenderElementProps {
  children: VNode
  element: Element
  attributes: HTMLAttributes & {
    "data-slate-node": "element"
    "data-slate-inline"?: true
    "data-slate-void"?: true
    dir?: "rtl"
    ref: any
  };
}

function renderElement (props: RenderElementProps) => VNode
```

### renderLeaf
> customize the rendering of leaf nodes in the document tree of your Slate editor
```typescript
export interface RenderLeafProps {
  children: VNode
  leaf: Text
  text: Text
  attributes: HTMLAttributes & {
    "data-slate-leaf": true
  };
}
```

### renderPlaceholder
> customize how the placeholder of the Slate.js Editable component is rendered when the editor is empty
```typescript
export interface RenderPlaceholderProps {
  children?: string
  attributes: HTMLAttributes & VNodeProps & {
    "data-slate-placeholder": boolean
    dir?: "rtl"
  };
}
```

## Editable
> customize style of editablearea, you can inherient other HTMLAttribute on it
```typescript
export interface EditableProps extends HTMLAttributes {
  role?: string
  readOnly: boolean
  placeholder?: string
  style?: CSSProperties
  scrollSelectionIntoView: (
    editor: DOMEditor,
    domRange: globalThis.Range
  ) => void
  is: string
}
```

# Component Emits

## onchange
> any change in slate will trigger it
```typescript
const onchange: (event: Descendant[]) => void
```

## onvaluechange
> slate children change in slate will trigger it
```typescript
const onvaluechange: (event: Descendant[]) => void
```

## onselectionchange
> slate selection change in slate will trigger it
```typescript
const onselectionchange: (event: Selection) => void
```

# Hooks in slate-vue3

## [useComposing](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-composing.ts)
> Get the current composing state of the editor. It deals with compositionstart, compositionupdate, compositionend events
```typescript
const useComposing: () => Ref<boolean, boolean>

const composing = useComposing()
```

## [useFocused](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-focus.ts)
> Get the current focused state of the editor
```typescript
const useFocused: () => Ref<boolean, boolean>

const focused = useFocused()
```

## [useReadOnly](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-read-only.ts)
> Get the current readOnly state of the editor
```typescript
const useReadOnly: () => Ref<boolean, boolean>

const readonly = useReadOnly()
```

## [useSelected](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selected.ts)
> Get the current selected state of an element
```typescript
const useSelected: () => ComputedRef<boolean>

const selected = useSelected()
```

## [useEditor](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-editor.ts)
> Get the current editor object from the context. Context whenever changes occur in the editor
```typescript
const useEditor: () => DOMEditor

const editor = useEditor()
```

## [useSelection](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selection.ts)
> Get the current editor selection from the context

```typescript
const useSelection: () => ComputedRef<BaseSelection>

const selection = useSelection()
```


## [useInheritRef](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-inherit-ref.ts)
> Automatically bind ref to the real node when the component is mounted，This is important when rendering element nodes directly
```typescript
const useInheritRef: (attribute: VNodeProps) => VNodeProps & {
    inheritRef?: VNodeRef
};

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
### 1. Why do I have to pass renderFunction into <Slate /> component ?
This ensures that your rich text is as expected, and slave-vue3 provides some default rendering functions, you can directly use the default rendering behavior

### 2. Can I use jsx in slate-vue3 ?
Of coures yes, but we do not recommend it unless you have already configured jsx in the project, as a branch, using the h function directly is already simple enough

### 3. Why do rendering functions not use Vue components ?
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
