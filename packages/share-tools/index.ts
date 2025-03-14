import { isProxy, toRaw } from "vue";

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o: any): boolean {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export function isPlainObject(o: any): boolean {
  var ctor, prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

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
