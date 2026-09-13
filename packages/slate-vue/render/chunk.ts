import { inject, provide, VNode } from "vue";
import { RenderChunkProps } from "../utils/interface";

export const SLATE_INNER_RENDER_CHUNK = Symbol("SLATE_INNER_RENDER_CHUNK");
export const provideRenderChunk = (fn: (props: RenderChunkProps) => VNode) =>
  provide(SLATE_INNER_RENDER_CHUNK, fn);
export const useRenderChunk = () => {
  const CHUNK_RENDER = inject<(props: RenderChunkProps) => VNode>(
    SLATE_INNER_RENDER_CHUNK,
  );
  if (CHUNK_RENDER === undefined) {
    throw new Error(
      `The \`useRenderChunk\` hook must be used inside the <Slate> component's context.`,
    );
  }
  return CHUNK_RENDER;
};
