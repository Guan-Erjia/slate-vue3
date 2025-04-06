Provides the same interface as the **slate-dom** library, removed some useless **APIs**

### The removed interfaces are as follows

1. ~~`mergeStringDiffs`~~

2. ~~`normalizePoint`~~

3. ~~`normalizeRange`~~

4. ~~`targetRange`~~

5. ~~`verifyDiffState`~~

> #### In vue3, diff is already synchronized and does not require merging or verify operations

### The remove type are as follows

1. ~~`DOMElement`~~ => `globalThis.Element`

2. ~~`DOMNode`~~ => `globalThis.Node`

3. ~~`DOMRange`~~ => `globalThis.Range`

4. ~~`DOMSelection`~~ => `globalThis.Selection`

5. ~~`DOMStaticRange`~~ => `globalThis.StaticRange`

6. ~~`DOMText`~~ => `globalThis.Text`

7. ~~`DOMPoint`~~ => `[globalThis.Node, number]`

> #### To avoid exposing conflicts with native interface names, they can be obtained through GlobalThis during development, and there is no need to specifically expose them

### The remove Weakmap are as follows

1. ~~`EDITOR_TO_PENDING_ACTION`~~

2. ~~`EDITOR_TO_PENDING_DIFFS`~~

3. ~~`EDITOR_TO_PENDING_INSERTION_MARKS`~~

4. ~~`EDITOR_TO_PENDING_SELECTION`~~

5. ~~`IS_NODE_MAP_DIRTY`~~

6. ~~`EDITOR_TO_SCHEDULE_FLUSH`~~

> #### Due to the stable declaration cycle and synchronous updates of data in vue3, there is no need to save the update status on Weakmap

1. ~~`EDITOR_TO_FORCE_RENDER`~~

2. ~~`EDITOR_TO_PLACEHOLDER_ELEMENT`~~

3. ~~`PLACEHOLDER_SYMBOL`~~

> #### It can be obtained using the provide or getCurrentInstance method without the need for Weakmap
