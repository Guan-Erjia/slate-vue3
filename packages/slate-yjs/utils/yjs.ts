import { AbstractType } from "yjs";

export function assertDocumentAttachment<T extends AbstractType<any>>(
  sharedType: T,
): asserts sharedType is T & { doc: NonNullable<T["doc"]> } {
  if (!sharedType.doc) {
    throw new Error("shared type isn't attached to a document");
  }
}
