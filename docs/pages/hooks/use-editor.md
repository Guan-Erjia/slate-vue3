> Get the current editor object from the context, the returned result is a proxy object

```typescript
import { useEditor } from "slate-vue3";

const useEditor: () => DOMEditor;

const editor = useEditor();
```

> Get the current editor raw object from the context, it won't trigger rerender when children and selection change

```typescript
import { useEditorStatic } from "slate-vue3";

const useEditorStatic: () => DOMEditor;

const staticEditor = useEditorStatic();
```