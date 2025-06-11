> Get the current element object. Re-renders whenever the element or any of its descendants changes.

```typescript
import { useElement } from "slate-vue3";

const useElement: () =>  ComputedRef<Element>;

const element = useElement();
```
  
  
  
> The same as useElement() but returns null instead of throwing an error when not inside an element.
```typescript
import { useElementIf } from "slate-vue3";

const useElementIf: () =>  ComputedRef<Element | null>;

const elementIf = useElementIf();
```
