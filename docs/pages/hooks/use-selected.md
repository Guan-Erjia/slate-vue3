> Get the current selected state of an element

```typescript
import { useSelected } from "slate-vue3";

const useSelected: (options?: {
  suppressThrow?: boolean;
}) => ComputedRef<boolean>;

const selected = useSelected();
```
