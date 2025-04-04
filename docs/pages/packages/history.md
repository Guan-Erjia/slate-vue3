Provides the same interface as the [**slate-history**](https://docs.slatejs.org/libraries/slate-history) library

## withHistory

The **withHistory** plugin adds the **HistoryEditor** to an **Editor** instance and keeps track of the operation history of a Slate editor as operations are applied to it, using undo and redo stacks.

```typescript
withHistory<T extends Editor>(editor: T): T & HistoryEditor
```

Add **HistoryEditor** interface to an instance of any **Editor**.

When used with **withReact**, **withHistory** should be applied inside. For example:

```typescript
const editor = withDOM(withHistory(createEditor()));
```

## History Editor

The **HistoryEditor** interface is added to the **Editor** when it is instantiated using the **withHistory** method.

```typescript
const editor = withDOM(withHistory(createEditor()));
```

This adds properties to **editor** that enables undo and redo in Slate.

There are also static methods for working with the Editor's undo/redo history.

```typescript
export interface HistoryEditor extends BaseEditor {
  history: History;
  undo: () => void;
  redo: () => void;
  writeHistory: (stack: "undos" | "redos", batch: any) => void;
}
```

## Static methods

#### Undo and Redo

```typescript
HistoryEditor.redo(editor: HistoryEditor): void
```

Redo to the next saved state.

```typescript
HistoryEditor.undo(editor: HistoryEditor): void
```

Undo to the previous saved state.

### Merging and Saving

```typescript
HistoryEditor.withMerging(editor: HistoryEditor, fn: () => void): void
```

Apply a series of changes inside a synchronous **fn**, These operations will
be merged into the previous history.

```typescript
HistoryEditor.withNewBatch(editor: HistoryEditor, fn: () => void): void
```

Apply a series of changes inside a synchronous **fn**, ensuring that the first
operation starts a new batch in the history. Subsequent operations will be
merged as usual.

```typescript
HistoryEditor.withoutMerging(editor: HistoryEditor, fn: () => void): void
```

Apply a series of changes inside a synchronous **fn**, without merging any of
the new operations into previous save point in the history.

```typescript
HistoryEditor.withoutSaving(editor: HistoryEditor, fn: () => void): void
```

Apply a series of changes inside a synchronous **fn**, without saving any of
their operations into the history.

### Check methods

```typescript
HistoryEditor.isHistoryEditor(value: any): value is HistoryEditor
```

Check if a value is a **HistoryEditor** (i.e. it has the **HistoryEditor** interface).

```typescript
HistoryEditor.isMerging(editor: HistoryEditor): boolean | undefined
```

Get the merge flag's current value.

```typescript
HistoryEditor.isSaving(editor: HistoryEditor): boolean | undefined
```

Get the saving flag's current value.

## Instance methods

```typescript
undo(): void
```

Undo the last batch of operations

```typescript
redo(): void
```

Redo the last undone batch of operations

```typescript
writeHistory(stack: 'undos'| 'redos', batch: any) => void
```

Push a batch of operations as either **undos** or **redos** onto **editor.undos** or **editor.redos**

## History

The **History** object contains the undo and redo history for the editor.

It can be accessed from an **Editor** instance as the property **history**.

This property is only available on the **Editor** if the editor was instantiated using the **withHistory** method which adds undo/redo functionality to the Slate editor.

```typescript
export interface History {
  redos: Batch[];
  undos: Batch[];
}

interface Batch {
  operations: Operation[];
  selectionBefore: Range | null;
}
```

## Static Methods

```typescript
History.isHistory(value: any): value is History
```
Returns true if the passed in value is a History object and also acts as a type guard for **History**.
