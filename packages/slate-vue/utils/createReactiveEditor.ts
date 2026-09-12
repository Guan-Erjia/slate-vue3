import {
  apply,
  createEditor,
  above,
  after,
  before,
  deleteBackward,
  deleteForward,
  edges,
  elementReadOnly,
  end,
  first,
  fragment,
  getVoid,
  hasBlocks,
  hasInlines,
  hasPath,
  hasTexts,
  isBlock,
  isEdge,
  isEmpty,
  isEnd,
  isNormalizing,
  isStart,
  last,
  leaf,
  levels,
  marks,
  next,
  node,
  nodes,
  normalize,
  parent,
  path,
  pathRef,
  pathRefs,
  point,
  pointRef,
  pointRefs,
  positions,
  previous,
  range,
  rangeRef,
  rangeRefs,
  setNormalizing,
  shouldMergeNodesRemovePrevNode,
  start,
  string,
  unhangRange,
  withoutNormalizing,
  addMark,
  deleteFragment,
  getDirtyPaths,
  getFragment,
  insertBreak,
  insertFragment,
  insertNode,
  insertSoftBreak,
  insertText,
  normalizeNode,
  removeMark,
  shouldNormalize,
  collapse,
  deselect,
  move,
  select,
  setPoint,
  setSelection,
  insertNodes,
  liftNodes,
  mergeNodes,
  moveNodes,
  removeNodes,
  setNodes,
  splitNodes,
  unsetNodes,
  unwrapNodes,
  wrapNodes,
  deleteText,
} from "slate-vue3/core";
import { DOMEditor, withDOM } from "slate-vue3/dom";
import { shallowReactive } from "vue";

export const createReactiveEditor = (): DOMEditor => {
  const editor = shallowReactive(createEditor());

  // Core
  editor.apply = (...args) => apply(editor, ...args);

  // Editor
  editor.addMark = (...args) => addMark(editor, ...args);
  editor.deleteBackward = (...args) => deleteBackward(editor, ...args);
  editor.deleteForward = (...args) => deleteForward(editor, ...args);
  editor.deleteFragment = (...args) => deleteFragment(editor, ...args);
  editor.getFragment = (...args) => getFragment(editor, ...args);
  editor.insertBreak = (...args) => insertBreak(editor, ...args);
  editor.insertSoftBreak = (...args) => insertSoftBreak(editor, ...args);
  editor.insertFragment = (...args) => insertFragment(editor, ...args);
  editor.insertNode = (...args) => insertNode(editor, ...args);
  editor.insertText = (...args) => insertText(editor, ...args);
  editor.normalizeNode = (...args) => normalizeNode(editor, ...args);
  editor.removeMark = (...args) => removeMark(editor, ...args);
  editor.getDirtyPaths = (...args) => getDirtyPaths(editor, ...args);
  editor.shouldNormalize = (...args) => shouldNormalize(editor, ...args);

  // Editor interface
  editor.above = (...args) => above(editor, ...args);
  editor.after = (...args) => after(editor, ...args);
  editor.before = (...args) => before(editor, ...args);
  editor.collapse = (...args) => collapse(editor, ...args);
  editor.delete = (...args) => deleteText(editor, ...args);
  editor.deselect = (...args) => deselect(editor, ...args);
  editor.edges = (...args) => edges(editor, ...args);
  editor.elementReadOnly = (...args) => elementReadOnly(editor, ...args);
  editor.end = (...args) => end(editor, ...args);
  editor.first = (...args) => first(editor, ...args);
  editor.fragment = (...args) => fragment(editor, ...args);
  editor.getMarks = (...args) => marks(editor, ...args);
  editor.hasBlocks = (...args) => hasBlocks(editor, ...args);
  editor.hasInlines = (...args) => hasInlines(editor, ...args);
  editor.hasPath = (...args) => hasPath(editor, ...args);
  editor.hasTexts = (...args) => hasTexts(editor, ...args);
  editor.insertNodes = (...args) => insertNodes(editor, ...args);
  editor.isBlock = (...args) => isBlock(editor, ...args);
  editor.isEdge = (...args) => isEdge(editor, ...args);
  editor.isEmpty = (...args) => isEmpty(editor, ...args);
  editor.isEnd = (...args) => isEnd(editor, ...args);
  editor.isNormalizing = (...args) => isNormalizing(editor, ...args);
  editor.isStart = (...args) => isStart(editor, ...args);
  editor.last = (...args) => last(editor, ...args);
  editor.leaf = (...args) => leaf(editor, ...args);
  editor.levels = (...args) => levels(editor, ...args);
  editor.liftNodes = (...args) => liftNodes(editor, ...args);
  editor.mergeNodes = (...args) => mergeNodes(editor, ...args);
  editor.move = (...args) => move(editor, ...args);
  editor.moveNodes = (...args) => moveNodes(editor, ...args);
  editor.next = (...args) => next(editor, ...args);
  editor.node = (...args) => node(editor, ...args);
  editor.nodes = (...args) => nodes(editor, ...args);
  editor.normalize = (...args) => normalize(editor, ...args);
  editor.parent = (...args) => parent(editor, ...args);
  editor.path = (...args) => path(editor, ...args);
  editor.pathRef = (...args) => pathRef(editor, ...args);
  editor.pathRefs = (...args) => pathRefs(editor, ...args);
  editor.point = (...args) => point(editor, ...args);
  editor.pointRef = (...args) => pointRef(editor, ...args);
  editor.pointRefs = (...args) => pointRefs(editor, ...args);
  editor.positions = (...args) => positions(editor, ...args);
  editor.previous = (...args) => previous(editor, ...args);
  editor.range = (...args) => range(editor, ...args);
  editor.rangeRef = (...args) => rangeRef(editor, ...args);
  editor.rangeRefs = (...args) => rangeRefs(editor, ...args);
  editor.removeNodes = (...args) => removeNodes(editor, ...args);
  editor.select = (...args) => select(editor, ...args);
  editor.setNodes = (...args) => setNodes(editor, ...args);
  editor.setNormalizing = (...args) => setNormalizing(editor, ...args);
  editor.setPoint = (...args) => setPoint(editor, ...args);
  editor.setSelection = (...args) => setSelection(editor, ...args);
  editor.splitNodes = (...args) => splitNodes(editor, ...args);
  editor.start = (...args) => start(editor, ...args);
  editor.string = (...args) => string(editor, ...args);
  editor.unhangRange = (...args) => unhangRange(editor, ...args);
  editor.unsetNodes = (...args) => unsetNodes(editor, ...args);
  editor.unwrapNodes = (...args) => unwrapNodes(editor, ...args);
  editor.void = (...args) => getVoid(editor, ...args);
  editor.withoutNormalizing = (...args) => withoutNormalizing(editor, ...args);
  editor.wrapNodes = (...args) => wrapNodes(editor, ...args);
  editor.shouldMergeNodesRemovePrevNode = (...args) =>
    shouldMergeNodesRemovePrevNode(editor, ...args);

  return withDOM(editor);
};
