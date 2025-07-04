import { Editor, EditorInterface } from '../interfaces/editor'
import { Range } from '../interfaces/range'
import { Node } from '../interfaces/node'
import { Operation } from '../interfaces/operation'
import { isObject } from '../utils'
import { toRawWeakSet as WeakSet } from 'share-tools'

export const IS_EDITOR_SET  = new WeakSet<Editor>()

export const isEditor: EditorInterface['isEditor'] = (
  value: any,
  { deep = false } = {}
): value is Editor => {
  // 如果集合中存在可直接判断为 isEditor
  if(IS_EDITOR_SET.has(value)) {
    return true
  }
  if (!isObject(value)) {
    return false
  }

  const isEditor =
    typeof value.addMark === 'function' &&
    typeof value.apply === 'function' &&
    typeof value.deleteFragment === 'function' &&
    typeof value.insertBreak === 'function' &&
    typeof value.insertSoftBreak === 'function' &&
    typeof value.insertFragment === 'function' &&
    typeof value.insertNode === 'function' &&
    typeof value.insertText === 'function' &&
    typeof value.isElementReadOnly === 'function' &&
    typeof value.isInline === 'function' &&
    typeof value.isSelectable === 'function' &&
    typeof value.isVoid === 'function' &&
    typeof value.normalizeNode === 'function' &&
    typeof value.onChange === 'function' &&
    typeof value.removeMark === 'function' &&
    typeof value.getDirtyPaths === 'function' &&
    (value.marks === null || isObject(value.marks)) &&
    (value.selection === null || Range.isRange(value.selection)) &&
    (!deep || Node.isNodeList(value.children)) &&
    Operation.isOperationList(value.operations)

    return isEditor
}
