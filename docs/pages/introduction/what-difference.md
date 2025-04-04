# what-difference

## USAGE

We have retained the vast majority of slab react operations and only modified the parameters and rendering implementation of some components

You need to pay attention to the parameter changes of the components. Some parameters have been elevated to the Slate component for ease of use in the editor context

## RENDER FUNCTION

The rendering functions of Slate include renderElement and renderLeaf, which implement branch judgment operations without state. 

Since Vue does not provide jsx by default, the h function is used to implement them, as shown below
```typescript
const renderElement = ({ attributes, children, element }: RenderElementProps) => {
  switch ((element as any).type) {
    case 'heading':
      return h('h' + element.depth, attributes, children);
    case 'code':
      return h(CodeBlock, { ...useInheritRef(attributes), element }, () => children)
    case 'list':
      return h(element.ordered ? 'ol' : 'ul', attributes, children)
    case 'listItem':
      return h('li', attributes, children)
    case 'link':
      return h('a', { href: (element as any).url, target: '_blank' }, children)
    case 'blockquote':
      return h('blockquote', attributes, children)
    default:
      return h('p', attributes, children);
  }
}
```

> The h function can already cover the vast majority of scenarios and is concise enough. It is not recommended to add additional jsx

**The rendering function must be passed into the Slate component, and its behavior needs to be clearly defined. We also provide default rendering functions for use**

## REACTIVE

Due to the fact that Vue's rendering relies on variable response data, the children of the editor are a responsive proxy. You can directly manipulate the editor by modifying the children property of the editor

> We do not recommend doing so. Each Transform operation is a collection of operations, which may cause cursor loss or other unexpected situations

## SYNA DATA

Vue can provide a stable lifecycle, and all reactive data is synchronized without the need to poll and listen for child nodes.

Therefore, some asynchronous operations such as timeouts have been removed.

This change covers the rendering implementation of DOM and Vue packages, and some useless interfaces have also been removed from YJS packages

## PACKAGES

There are many changes made, and almost every package in Slate has been modified. Changing the name of each package and sending it again is obviously unreasonable.

We have consolidated all the packages in Slate-vue3 and introduced them as needed through diagonal lines,
```typescript
import { Slate, Editable } from 'slate-vue3';
import { createEditor, Editor,} from 'slate-vue3/core';
import { withDOM } from 'slate-vue3/dom';
import { withHistory } from 'slate-vue3/history';
...
```