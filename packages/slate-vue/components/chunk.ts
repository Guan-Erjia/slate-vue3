import { ChunkAncestor, ChunkTree } from "slate-dom";
import { defineComponent, h, renderList, VNode } from "vue";
import { useRenderChunk } from "../hooks/use-render";
import { ElementComp } from "./element";

export const ChunkComp = defineComponent({
  props: ["root", "ancestor"],
  setup(props: { root: ChunkTree; ancestor: ChunkAncestor }) {
    const { root, ancestor } = props;
    const renderChunk = useRenderChunk();
    return () =>
      renderList(ancestor.children, (chunkNode): VNode => {
        if (chunkNode.type === "chunk") {
          return renderChunk({
            highest: root === ancestor,
            lowest: chunkNode.children.some((c) => c.type === "leaf"),
            attributes: { "data-slate-chunk": true },
            children: h(ChunkComp, {
              root,
              ancestor: chunkNode,
            }),
          });
        }

        // Only blocks containing no inlines are chunked
        return h(ElementComp, { element: chunkNode.node });
      });
  },
});
