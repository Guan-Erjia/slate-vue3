import { Element } from "slate";
import { ChunkAncestor, ChunkTree } from "slate-dom";
import { defineComponent, h, renderList, VNode } from "vue";
import { useRenderChunk } from "../hooks/use-render";
import { Key } from "slate-dom";

export const ChunkComp = defineComponent({
  props: ["root", "ancestor", "renderElement"],
  setup(props: {
    root: ChunkTree;
    ancestor: ChunkAncestor;
    renderElement: (node: Element, index: number, key: Key) => VNode;
  }) {
    const { root, ancestor, renderElement } = props;
    const renderChunk = useRenderChunk();
    return renderList(root.children, (chunkNode) => {
      if (chunkNode.type === "chunk") {
        const renderedChunk = renderChunk({
          highest: root === ancestor,
          lowest: chunkNode.children.some((c) => c.type === "leaf"),
          attributes: { "data-slate-chunk": true },
          children: h(ChunkComp, {
            root,
            ancestor: chunkNode,
            renderElement,
          }),
        });

        return renderedChunk;
      }

      // Only blocks containing no inlines are chunked
      return h(Element, { element: chunkNode.node });
    });
  },
});
