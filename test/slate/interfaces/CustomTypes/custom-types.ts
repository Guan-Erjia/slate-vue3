import { Descendant, Operation } from "slate";

export type HeadingElement = {
  type: "heading";
  level: number;
  children: Descendant[];
};

export type ListItemElement = {
  type: "list-item";
  depth: number;
  children: Descendant[];
};

export type CustomText = {
  placeholder?: string;
  bold?: boolean;
  italic?: boolean;
  text: string;
};

export type CustomOperation = {
  type: "custom_op";
  value: string;
};

export type ExtendedOperation = Operation | CustomOperation;

export type CustomElement = HeadingElement | ListItemElement;

export const skip = true;
