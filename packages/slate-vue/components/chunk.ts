import { Element } from "slate";
import {
  ChunkAncestor as TChunkAncestor,
  ChunkTree as TChunkTree,
} from "../../slate-dom/chunking";
import { ComputedRef, defineComponent, h, renderList } from "vue";
import { useRenderChunk, useRenderElement } from "../hooks/use-render";

export const ChunkTree = defineComponent({
  props: {
    root: {
      type: Object,
      require: true,
    },
  },
  setup(props: { root: ComputedRef<TChunkTree> }) {
    const root = props.root;
    const renderChunk = useRenderChunk();
    return renderList(root.value.children, (chunkNode) => {
      if (chunkNode.type === "chunk") {
        const renderedChunk = renderChunk({
          highest: true,
          lowest: chunkNode.children.some((c) => c.type === "leaf"),
          attributes: { "data-slate-chunk": true },
          children: h(ChunkTree, {
            root,
            ancestor: chunkNode,
          }),
        });

        return renderedChunk;
      }

      // Only blocks containing no inlines are chunked
      const element = chunkNode.node as Element;
      return h(Element, { element });
    });
  },
});
