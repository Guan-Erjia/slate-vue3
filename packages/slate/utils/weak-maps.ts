import { Editor, Path, PathRef, PointRef, RangeRef } from '..'
import { toRawWeakMap as WeakMap } from 'share-tools'

export const DIRTY_PATHS: WeakMap<Editor, Path[]> = new WeakMap()
export const DIRTY_PATH_KEYS: WeakMap<Editor, Set<string>> = new WeakMap()
export const FLUSHING: WeakMap<Editor, boolean> = new WeakMap()
export const NORMALIZING: WeakMap<Editor, boolean> = new WeakMap()
export const PATH_REFS: WeakMap<Editor, Set<PathRef>> = new WeakMap()
export const POINT_REFS: WeakMap<Editor, Set<PointRef>> = new WeakMap()
export const RANGE_REFS: WeakMap<Editor, Set<RangeRef>> = new WeakMap()
