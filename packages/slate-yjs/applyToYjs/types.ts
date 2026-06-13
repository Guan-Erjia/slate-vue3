import { Node, Operation } from "slate-vue3/core";
import { XmlText } from "yjs";

export type ApplyFunc<O extends Operation = Operation> = (
  sharedRoot: XmlText,
  slateRoot: Node,
  op: O,
) => void;

export type OpMapper<O extends Operation = Operation> = {
  [K in O["type"]]: O extends { type: K } ? ApplyFunc<O> : never;
};
