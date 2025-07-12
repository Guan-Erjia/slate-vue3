# Slate

The `Slate` component is used to provide necessary rendering context and is a component without real DOM node

```typescript
interface SlateComponentProps {
  editor: DOMEditor;
  decorate: (entry: NodeEntry) => DecoratedRange[];
  renderElement: (props: RenderElementProps) => VNode;
  renderLeaf: (props: RenderLeafProps) => VNode;
  renderText: (props: RenderTextProps) => VNode;
  renderChunk: (props: RenderChunkProps) => VNode;
  renderPlaceholder: (props: RenderPlaceholderProps) => VNode;
}
```

## editor

You need to create a slate instance through the `creatEditor` API and pass it into the component for context sharing through the **`top-level`** component

```typescript
import { createEditor, Descendant } from "slate-vue3/core";
const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];
const editor = createEditor();
editor.children = initialValue;
```

## renderElement

Rendering the control function of `Element` nodes, making branch judgments based on node data, and returning the corresponding `VNode`

```typescript
export interface RenderElementProps {
  children: VNode;
  element: Element;
  attributes: HTMLAttributes & {
    "data-slate-node": "element";
    "data-slate-inline"?: true;
    "data-slate-void"?: true;
    dir?: "rtl";
    ref: VNodeRef;
  };
}
function renderElement(props: RenderElementProps): VNode {}
```

## renderLeaf

Render leaf nodes and return `VNode` based on the passed text and leaf parameters

```typescript
export interface RenderLeafProps {
  children: VNode;
  leaf: Text;
  text: Text;
  attributes: HTMLAttributes & {
    "data-slate-leaf": true;
  };
}
function renderLeaf(props: RenderLeafProps): VNode {}
```

## renderText

Control the rendering style of Text nodes, return `VNode` based on the passed text and leaf parameters

```typescript
export interface RenderTextProps {
  text: Text;
  children: VNode;
  attributes: {
    "data-slate-node": "text";
    ref: VNodeRef;
  };
}
function renderText(props: RenderTextProps): VNode {}
```

## renderPlaceholder

Customize placeholder rendering, accept placeholder parameters, and return a `VNode`

```typescript
export interface RenderPlaceholderProps {
  children?: string;
  attributes: HTMLAttributes &
    VNodeProps & {
      "data-slate-placeholder": boolean;
      dir?: "rtl";
    };
}
function renderPlaceholder(props: RenderPlaceholderProps): VNode {}
```

## renderChunk

After the editor is split into chunks, the rendering content of each chunk can be customized to improve performance when the editor content is too large.[**See the example**](https://guan-erjia.github.io/slate-vue3/examples/with-chunks)

```typescript
export interface RenderChunkProps {
  highest: boolean
  lowest: boolean
  children: any
  attributes: {
    'data-slate-chunk': true
  }
}
function renderChunk(props: RenderChunkProps): VNode {}
```


## decorate

The parameters are the current `node` and `path`, returning the node interval and modifying attributes

Perform final modifications on existing leaf nodes, including **adding attributes** and **splitting nodes**

> In most scenarios, rendering is done in conjunction with the renderLeaf function

```typescript
function decorate(entry: NodeEntry): DecoratedRange[] {}
```

You can see the usage in:

1. [**cursor segmentation**](/slate-vue3/examples/cursor-segmentation) (simple)
2. [**code highlighting**](/slate-vue3/examples/code-highlighting) (complex)

## @change

> any change in slate will trigger it

```typescript
const onchange: (event: { operation?: Operation }) => void;
```

## @valuechange

> slate children change in slate will trigger it

```typescript
const onvaluechange: (event: { operation?: Operation }) => void;
```

## @selectionchange

> slate selection change in slate will trigger it

```typescript
const onselectionchange: (event: { operation?: Operation }) => void;
```
