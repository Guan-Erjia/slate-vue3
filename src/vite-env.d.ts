/// <reference types="vite/client" />

declare module "is-plain-object" {
  export const isPlainObject: (value: any) => value is object;
}
