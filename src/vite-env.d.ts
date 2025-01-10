/// <reference types="vite/client" />

declare module "is-plain-object" {
  const isPlainObject: (value: any) => value is object;
  export default isPlainObject;
}
