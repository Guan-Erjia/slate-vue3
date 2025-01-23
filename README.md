[<img src="https://raw.githubusercontent.com/ianstormtaylor/slate/main/docs/images/banner.png" />](https://github.com/ianstormtaylor/slate/raw/main/docs/images/banner.png)
<p align="center">
  Slate-react library implemented with vue
</p>
<br/>

# why use it?
1. This library provides the same usage as slate-react
2. This library will be updated with slate-react
3. In a project, you can easily use vue-devtools to debug


# compact files of slate
## reactive implement
  1. packages/slate/src/interfaces/text.ts 115:115
  2. packages/slate/src/create-editor.ts 94:94
  3. packages/slate/src/transforms-node/set-nodes.ts 18:18
## remove immer
  1. packages/slate/src/interfaces/node.ts 365:365
  2. packages/slate/src/interfaces/point.ts 103:103
  3. packages/slate/src/interfaces/range.ts 224:224
  4. packages/slate/src/interfaces/transforms/general.ts 322:333
## rewrite implement for WeakMap
  1. packages/un-proxy-weakmap/src/index.ts