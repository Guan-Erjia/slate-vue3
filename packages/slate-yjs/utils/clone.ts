import { XmlText } from 'yjs';
import { InsertDelta } from '../model/types';
import { yTextToInsertDelta } from './delta';

export function cloneInsertDeltaDeep(delta: InsertDelta): InsertDelta {
  return delta.map((element) => {
    if (typeof element.insert === 'string') {
      return element;
    }

     
    return { ...element, insert: cloneDeep(element.insert) };
  });
}

export function cloneDeep(yText: XmlText): XmlText {
  const clone = new XmlText();

  const attributes = yText.getAttributes();
  Object.entries(attributes).forEach(([key, value]) => {
    clone.setAttribute(key, value);
  });

  clone.applyDelta(cloneInsertDeltaDeep(yTextToInsertDelta(yText)), {
    sanitize: false,
  });

  return clone;
}
