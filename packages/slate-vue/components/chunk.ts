import { ChunkAncestor } from "slate-dom";
import { defineComponent, h, renderList, VNode } from "vue";
import { useRenderChunk, useStaticChunk } from "../hooks/use-render";
import { ElementComp } from "./element";

export const ChunkComp = defineComponent({
  props: ["ancestor"],
  setup(props: { ancestor: ChunkAncestor }) {
    const ancestor = props.ancestor;
    const root = useStaticChunk();
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
            }),
          });
        }

        // @ts-ignore Only blocks containing no inlines are chunked
        return h(ElementComp, { element: chunkNode.node });
      });
  },
});
