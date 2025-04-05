> Get the current composing state of the editor, it deals with compositionstart, compositionupdate, compositionend events

```typescript
import { useComposing } from "slate-vue3";

const useComposing: () => Ref<boolean, boolean>;

const composing = useComposing();
```
