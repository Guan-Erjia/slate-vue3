import { isProxy, toRaw } from "vue";

export class toRawWeakMap<K extends WeakKey, V> {
  private weak: WeakMap<K, V>;
  constructor() {
    this.weak = new WeakMap();
  }
  /**
   * Removes the specified element from the toRawWeakMap.
   * @returns true if the element was successfully removed, or false if it was not present.
   */
  delete(key: K) {
    return this.weak.delete(isProxy(key) ? toRaw(key) : key);
  }
  /**
   * @returns a specified element.
   */
  get(key: K) {
    return this.weak.get(isProxy(key) ? toRaw(key) : key);
  }
  /**
   * @returns a boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K) {
    return this.weak.has(isProxy(key) ? toRaw(key) : key);
  }
  /**
   * Adds a new element with a specified key and value.
   * @param key Must be an object or symbol.
   */
  set(key: K, value: V) {
    return this.weak.set(isProxy(key) ? toRaw(key) : key, value);
  }
}
