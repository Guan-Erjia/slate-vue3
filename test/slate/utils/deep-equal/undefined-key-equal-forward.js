import { isDeepEqual } from "@test-utils";

export const input = {
  objectA: {
    text: "same text",
    bold: undefined,
  },
  objectB: {
    text: "same text",
  },
};

export const test = ({ objectA, objectB }) => {
  return isDeepEqual(objectA, objectB);
};

export const output = true;
