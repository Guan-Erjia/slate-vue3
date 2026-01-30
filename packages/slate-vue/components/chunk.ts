import { ChunkAncestor } from "slate-dom";
import { h, renderList, VNode } from "vue";
import { ElementComp } from "./element";
import { RenderChunkProps } from "../utils/interface";

export const ChunkCompFc = (
  ancestor: ChunkAncestor,
  renderChunk: (props: RenderChunkProps) => VNode,
  highest?: boolean,
) =>
  renderList(ancestor.children, (chunkNode): VNode => {
    if (chunkNode.type === "chunk") {
      return renderChunk({
        highest: highest === true,
        lowest: chunkNode.children.some((c) => c.type === "leaf"),
        attributes: { "data-slate-chunk": true, key: chunkNode.key.id },
        children: ChunkCompFc(chunkNode, renderChunk, false),
      });
    }

    return h(ElementComp, {
      // @ts-expect-error Only blocks containing no inlines are chunked
      element: chunkNode.node,
      key: chunkNode.key.id,
    });
  });
