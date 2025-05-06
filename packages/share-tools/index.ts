import { isProxy, toRaw } from "vue";

export class toRawWeakMap<K extends WeakKey, V> extends WeakMap {
  constructor() {
    super();
  }
  /**
   * Removes the specified element from the toRawWeakMap.
   * @returns true if the element was successfully removed, or false if it was not present.
   */
  delete(key: K) {
    return super.delete(isProxy(key) ? toRaw(key) : key);
  }
  /**
   * @returns a specified element.
   */
  get(key: K) {
    return super.get(isProxy(key) ? toRaw(key) : key);
  }
  /**
   * @returns a boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K) {
    return super.has(isProxy(key) ? toRaw(key) : key);
  }
  /**
   * Adds a new element with a specified key and value.
   * @param key Must be an object or symbol.
   */
  set(key: K, value: V) {
    return super.set(
      isProxy(key) ? toRaw(key) : key,
      isProxy(value) ? toRaw(value) : value
    );
  }
}
