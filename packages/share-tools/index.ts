import { toRaw } from "vue";

export class toRawWeakMap<K extends WeakKey, V> extends WeakMap {
  constructor() {
    super();
  }
  delete(key: K) {
    return super.delete(toRaw(key));
  }
  get(key: K) {
    return super.get(toRaw(key));
  }
  has(key: K) {
    return super.has(toRaw(key));
  }
  set(key: K, value: V) {
    return super.set(toRaw(key), value);
  }
}
