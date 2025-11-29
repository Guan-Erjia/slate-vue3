import { inject, provide, Ref } from "vue";

export const SLATE_INNER_EDITOR_VERSION = Symbol("SLATE_INNER_EDITOR_VERSION");
export const provideEditorVersion = (version: Ref<number>) =>
  provide(SLATE_INNER_EDITOR_VERSION, version);
export const useEditorVersion = () => {
  const EDITOR_VERSION = inject<Ref<number>>(SLATE_INNER_EDITOR_VERSION);
  if (EDITOR_VERSION === undefined) {
    throw new Error(
      `The \`useEditorVersion\` hook must be used inside the <Slate> component's context.`,
    );
  }

  return EDITOR_VERSION;
};

export const SLATE_INNER_EDITOR_NODE_VERSION = Symbol(
  "SLATE_INNER_EDITOR_NODE_VERSION",
);
export const provideEditorNodeVersion = (version: Ref<number>) =>
  provide(SLATE_INNER_EDITOR_NODE_VERSION, version);
export const useEditorNodeVersion = () => {
  const EDITOR_NODE_VERSION = inject<Ref<number>>(
    SLATE_INNER_EDITOR_NODE_VERSION,
  );
  if (EDITOR_NODE_VERSION === undefined) {
    throw new Error(
      `The \`useEditorNodeVersion\` hook must be used inside the <Slate> component's context.`,
    );
  }

  return EDITOR_NODE_VERSION;
};
