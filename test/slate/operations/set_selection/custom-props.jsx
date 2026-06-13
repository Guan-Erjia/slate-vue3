/** @jsx jsx */
import { jsx } from "@test-utils";
import { Transforms, Editor } from "slate-vue3/core";

export const input = (
  <editor>
    <element>
      a<cursor />
    </element>
  </editor>
);

export const operations = [
  {
    type: "set_selection",
    oldProperties: {},
    newProperties: { custom: 123 },
  },
];

export const output = (
  <editor>
    <element>
      a<cursor />
    </element>
  </editor>
);

Transforms.setSelection(output, { custom: 123 });
