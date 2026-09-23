import { defineComponent, h, onUpdated, renderList, VNode } from "vue";
import { ChunkAncestor, ChunkTree } from "../chunking";
import { RenderChunkProps } from "../utils/interface";
import { Key } from "slate-vue3/dom";
import { Element } from "slate";

export const ChunkTreeComp = defineComponent({
  props: ["ancestor", "root", "renderElement", "renderChunk"],
  setup(props: {
    ancestor: ChunkAncestor;
    root: ChunkTree;
    renderElement: (node: Element, index: number, key: Key) => VNode;
    renderChunk: (props: RenderChunkProps) => VNode;
  }) {
    onUpdated(() => {
      props.root.modifiedChunks.clear();
    });
    return () =>
      h(ChunkComp, {
        root: props.root,
        ancestor: props.ancestor,
        renderElement: props.renderElement,
        renderChunk: props.renderChunk,
      });
  },
});

export const ChunkComp = defineComponent({
  props: ["ancestor", "root", "renderElement", "renderChunk"],
  setup(props: {
    ancestor: ChunkAncestor;
    root: ChunkTree;
    renderElement: (node: Element, index: number, key: Key) => VNode;
    renderChunk: (props: RenderChunkProps) => VNode;
  }) {
    const chunkVNodeCache = new WeakMap<ChunkAncestor, VNode>();
    return () =>
      renderList(props.ancestor.children, (chunkNode): VNode => {
        if (chunkNode.type === "chunk") {
          const cachedVNode = chunkVNodeCache.get(chunkNode);
          // Chunking keeps each chunk level homogeneous, so checking the first
          // child is enough to determine whether this is the lowest chunk layer.

          if (cachedVNode && !props.root.modifiedChunks.has(chunkNode)) {
            return cachedVNode;
          }
          const vnode = props.renderChunk({
            highest: props.root === props.ancestor,
            lowest: chunkNode.children.some((c) => c.type === "leaf"),
            attributes: { "data-slate-chunk": true, key: chunkNode.key.id },
            children: h(ChunkComp, {
              root: props.root,
              ancestor: chunkNode,
              renderElement: props.renderElement,
              renderChunk: props.renderChunk,
            }),
          });
          chunkVNodeCache.set(chunkNode, vnode);
          return vnode;
        }

        return props.renderElement(
          chunkNode.node as unknown as Element,
          chunkNode.index,
          chunkNode.key,
        );
      });
  },
});
