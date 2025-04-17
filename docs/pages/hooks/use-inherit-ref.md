> Automatically bind ref to the real node when the component is mounted

```typescript
import { useInheritRef } from "slate-vue3";

const useInheritRef: (attribute: VNodeProps) => VNodeProps;

const renderElement = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case "image":
      return h(
        ImageComp,
        { element, ...useInheritRef(attributes) },
        () => children
      );
    default:
      return h("p", attributes, children);
  }
};
```

## What is its purpose

`slate-vue3` needs to know the real dom node to work by ref attribute, build relationship between the `slate-node` and `dom-node`. but it is difficult to pass the ref attribute to vue components. vue will remove ref attribute when it renders the vnode.

we can use **`onVNodeMounted`** to bind the ref attribute when vnode is mounted, it can get the real dom node on parent component.

> Without it you will get a error in the console, saying that slate can't find the node
