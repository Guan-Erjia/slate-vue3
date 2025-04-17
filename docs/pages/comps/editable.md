# Editable

`Editable` Create a real DOM root node, where the core logic of slate and user interaction is implemented.

> This component collects user operations and maps them to the slate

```typescript
interface EditableProps extends HTMLAttributes {
  role?: string;
  readOnly: boolean;
  placeholder?: string;
  style?: CSSProperties;
  scrollSelectionIntoView: (
    editor: DOMEditor,
    domRange: globalThis.Range
  ) => void;
  is: string;
}
```

## role

Same as the `role` attribute of HTML

## readOnly

Prevent editing when set to `true`

## placeholder

Placeholder text when the editor is **empty**

## scrollSelectionIntoView

Replace the default behavior of `scrollSelectionIntoView`

## style

Overwrite the default `style`

## is

Define the `HTML` tags for rendering the root node

## Event Listener

You can add event listeners at this node to override the internal behavior of `Editable` components

```html
<script setup lang="ts">
  const handleClick = () => {
    alert("clicked"!);
  };
</script>
<template>
  <Slate :editor="editor">
    <Editable @click="handleClick" />
  </Slate>
</template>
```
