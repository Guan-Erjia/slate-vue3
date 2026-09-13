import { defineComponent, h, renderList, VNode } from "vue";
import { ChunkAncestor, ChunkTree } from "../chunking";
import { useRenderChunk } from "../render/chunk";
import { Key } from "slate-vue3/dom";
import { Element } from "slate";

export const ChunkComp = defineComponent({
  props: ["root", "ancestor", "renderElement"],
  setup(props: {
    root: ChunkTree;
    ancestor: ChunkAncestor;
    renderElement: (node: Element, index: number, key: Key) => VNode;
  }) {
    const renderChunk = useRenderChunk();
    return () =>
      renderList(props.ancestor.children, (chunkNode): VNode => {
        if (chunkNode.type === "chunk") {
          // Chunking keeps each chunk level homogeneous, so checking the first
          // child is enough to determine whether this is the lowest chunk layer.

          return renderChunk({
            highest: props.ancestor === props.root,
            lowest: chunkNode.children.some((c) => c.type === "leaf"),
            attributes: { "data-slate-chunk": true, key: chunkNode.key.id },
            children: h(ChunkComp, {
              root: props.root,
              ancestor: chunkNode,
              renderElement: props.renderElement,
            }),
          });
        }

        return props.renderElement(
          chunkNode.node as unknown as Element,
          chunkNode.index,
          chunkNode.key,
        );
      });
  },
});
