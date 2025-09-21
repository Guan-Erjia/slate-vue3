import { toRaw } from "vue";

export class toRawWeakMap<K extends WeakKey, V> extends WeakMap {
  constructor() {
    super();
  }
  /**
   * Removes the specified element from the toRawWeakMap.
   * @returns true if the element was successfully removed, or false if it was not present.
   */
  delete(key: K) {
    return super.delete(toRaw(key));
  }
  /**
   * @returns a specified element.
   */
  get(key: K) {
    return super.get(toRaw(key));
  }
  /**
   * @returns a boolean indicating whether an element with the specified key exists or not.
   */
  has(key: K) {
    return super.has(toRaw(key));
  }
  /**
   * Adds a new element with a specified key and value.
   * @param key Must be an object or symbol.
   */
  set(key: K, value: V) {
    return super.set(toRaw(key), toRaw(value));
  }
}

export class toRawWeakSet<T extends WeakKey> extends WeakSet<T> {
  constructor() {
    super();
  }

  /**
   * Removes the specified element from the toRawWeakSet.
   * @returns true if the element was successfully removed, or false if it was not present.
   */
  delete(value: T): boolean {
    return super.delete(toRaw(value));
  }

  /**
   * @returns a boolean indicating whether an element with the specified value exists or not.
   */
  has(value: T): boolean {
    return super.has(toRaw(value));
  }

  /**
   * Adds a new element with a specified value.
   * @param value Must be an object or symbol.
   */
  add(value: T): this {
    return super.add(toRaw(value));
  }
}
