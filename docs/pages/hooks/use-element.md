> Get the current element object. Re-renders whenever the element or any of its descendants changes.

```typescript
import { useElementProps } from "slate-vue3";

const useElementProps: () => Element;

const element = useElementProps();
```

> The same as useElementProps() but returns null instead of throwing an error when not inside an element.

```typescript
import { useElementPropsIf } from "slate-vue3";

const useElementPropsIf: () => { element: Element | null };

const elementIf = useElementPropsIf();
```
