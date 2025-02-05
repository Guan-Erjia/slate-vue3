[<img src="https://raw.githubusercontent.com/ianstormtaylor/slate/main/docs/images/banner.png" />](https://github.com/ianstormtaylor/slate/raw/main/docs/images/banner.png)

<p align="center">
  slate-<a style="color: #087ea4" href="https://react.dev/">react</a> library implemented with <a style="color: #42b883" href="https://vuejs.org/">vue</a>
</p>
<br/>

# Why use it?

1. Use vue internal response implementation to reduce the number of re-renderings
2. You can easily use vue-devtools to debug in a vue project
3. This library provides the same usage as slate-react

# Demo

Check out the [**live demo**](https://guan-erjia.github.io/slate-vue3/) of all of the examples

# Hooks

## [useComposing](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-composing.ts)

```
const useFocused: () => Ref<boolean, boolean>
```

Get the current composing state of the editor. It deals with compositionstart, compositionupdate, compositionend events.

Composition events are triggered by typing (composing) with a language that uses a composition character (e.g. Chinese, Japanese, Korean, etc.) example.
Some basic Git commands are:

## [useFocused](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-focus.ts)

```
const useFocused: () => Ref<boolean, boolean>
```

Get the current focused state of the editor.

## [useReadOnly](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-read-only.ts)

```
const useReadOnly: () => Ref<boolean, boolean>
```

Get the current readOnly state of the editor.

## [useSelected](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selected.ts)

```
const useSelected: () => ComputedRef<boolean>
```

Get the current selected state of an element.

## [useEditor](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-editor.ts)

```
const useSlate: () => Editor;
```

Get the current editor object from the React context. Re-renders the context whenever changes occur in the editor.

## [useSelection](https://github.com/Guan-Erjia/slate-vue3/blob/master/packages/slate-vue/src/hooks/use-selection.ts)

```
const useSelection: () => ComputedRef<boolean>
```

Get the current editor selection from the React context.

# Packages

**slate's codebase is monorepo managed with pnpm workspace**

- [slate](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/slate)
  slate core logic, update synchronously with slate
- [slate-dom](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/slate-dom)
  Implementation of slate on dom, update synchronously with slate-dom
- [slate-vue](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/slate-vue)
  Vue components for rendering slate editors
- [share-tools](https://github.com/Guan-Erjia/slate-vue3/tree/master/packages/share-tools)
  for special processing of proxy type data, obtain the raw pointer, isPlainObject declare

# compact files of slate

**reactive implement**

1. packages/slate/src/interfaces/text.ts 115:115
2. packages/slate/src/create-editor.ts 94:94
3. packages/slate/src/transforms-node/set-nodes.ts 18:18

**remove immer**

1. packages/slate/src/interfaces/node.ts 365:365
2. packages/slate/src/interfaces/point.ts 103:103
3. packages/slate/src/interfaces/range.ts 224:224
4. packages/slate/src/interfaces/transforms/general.ts 322:333

**rewrite implement for WeakMap**

1. packages/un-proxy-weakmap/src/index.ts
2. packages/slate-dom/src/utils/weak-maps.ts

**import types from globalThis in slate-dom**
1. packages/slate-dom/src/index.ts
2. packages/slate-dom/src/plugin/dom-editor.ts
3. packages/slate-dom/src/utils/dom.ts

