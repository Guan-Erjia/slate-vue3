import { ChunkAncestor } from "slate-dom";
import { defineComponent, h, renderList, VNode } from "vue";
import { ElementComp } from "./element";
import { useChunkRoot, useRenderChunk } from "../render/chunk";

export const ChunkComp = defineComponent({
  name: "slate-chunk",
  props: ["ancestor"],
  setup(props: { ancestor: ChunkAncestor }) {
    const ancestor = props.ancestor;
    const root = useChunkRoot();
    const renderChunk = useRenderChunk();
    return () =>
      renderList(ancestor.children, (chunkNode): VNode => {
        if (chunkNode.type === "chunk") {
          return renderChunk({
            highest: root === ancestor,
            lowest: chunkNode.children.some((c) => c.type === "leaf"),
            attributes: { "data-slate-chunk": true },
            children: h(ChunkComp, {
              ancestor: chunkNode,
              key: chunkNode.key.id,
            }),
          });
        }

        return h(ElementComp, {
          // @ts-expect-error Only blocks containing no inlines are chunked
          element: chunkNode.node,
          key: chunkNode.key.id,
        });
      });
  },
});
