> Get the current editor object from the context, the returned result is a proxy object

```typescript
import { useEditor } from "slate-vue3";

const useEditor: () => DOMEditor;

const editor = useEditor();
```