import { BasePoint, BaseRange, Node, Text } from 'slate';
import { AbsolutePosition, createAbsolutePositionFromRelativePosition, createRelativePositionFromJSON, createRelativePositionFromTypeIndex, decodeRelativePosition, encodeRelativePosition, RelativePosition, XmlText } from 'yjs';
import { InsertDelta, RelativeRange, TextRange } from '../model/types';
import { getInsertDeltaLength, yTextToInsertDelta } from './delta';
import { getSlatePath, getYTarget, yOffsetToSlateOffsets } from './location';
import { assertDocumentAttachment } from './yjs';

export const STORED_POSITION_PREFIX = '__slateYjsStoredPosition_';

export function slatePointToRelativePosition(
  sharedRoot: XmlText,
  slateRoot: Node,
  point: BasePoint
): RelativePosition {
  const { yTarget, yParent, textRange } = getYTarget(
    sharedRoot,
    slateRoot,
    point.path
  );

  if (yTarget) {
    throw new Error(
      'Slate point points to a non-text element inside sharedRoot'
    );
  }

  const index = textRange.start + point.offset;
  return createRelativePositionFromTypeIndex(
    yParent,
    index,
    index === textRange.end ? -1 : 0
  );
}

export function absolutePositionToSlatePoint(
  sharedRoot: XmlText,
  slateRoot: Node,
  { type, index, assoc }: AbsolutePosition
): BasePoint | null {
  if (!(type instanceof XmlText)) {
    throw new Error('Absolute position points to a non-XMLText');
  }

  const parentPath = getSlatePath(sharedRoot, slateRoot, type);
  const parent = Node.get(slateRoot, parentPath);

  if (Text.isText(parent)) {
    throw new Error(
      "Absolute position doesn't match slateRoot, cannot descent into text"
    );
  }

  const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, index, {
    assoc,
  });

  const target = parent.children[pathOffset];
  if (!Text.isText(target)) {
    return null;
  }

  return { path: [...parentPath, pathOffset], offset: textOffset };
}

export function relativePositionToSlatePoint(
  sharedRoot: XmlText,
  slateRoot: Node,
  pos: RelativePosition
): BasePoint | null {
  if (!sharedRoot.doc) {
    throw new Error("sharedRoot isn't attach to a yDoc");
  }

  const absPos = createAbsolutePositionFromRelativePosition(
    pos,
    sharedRoot.doc
  );

  return absPos && absolutePositionToSlatePoint(sharedRoot, slateRoot, absPos);
}

export function getStoredPosition(
  sharedRoot: XmlText,
  key: string
): RelativePosition | null {
  const rawPosition = sharedRoot.getAttribute(STORED_POSITION_PREFIX + key);
  if (!rawPosition) {
    return null;
  }

  return decodeRelativePosition(rawPosition);
}

export function getStoredPositions(
  sharedRoot: XmlText
): Record<string, RelativePosition> {
  return Object.fromEntries(
    Object.entries(sharedRoot.getAttributes())
      .filter(([key]) => key.startsWith(STORED_POSITION_PREFIX))
      .map(([key, position]) => [
        key.slice(STORED_POSITION_PREFIX.length),
        createRelativePositionFromJSON(position),
      ])
  );
}

function getStoredPositionsAbsolute(sharedRoot: XmlText) {
  assertDocumentAttachment(sharedRoot);

  return Object.fromEntries(
    Object.entries(sharedRoot.getAttributes())
      .filter(([key]) => key.startsWith(STORED_POSITION_PREFIX))
      .map(
        ([key, position]) =>
          [
            key.slice(STORED_POSITION_PREFIX.length),
            createAbsolutePositionFromRelativePosition(
              decodeRelativePosition(position),
              sharedRoot.doc
            ),
          ] as const
      )
      .filter(([, position]) => position)
  ) as Record<string, AbsolutePosition>;
}

export function removeStoredPosition(sharedRoot: XmlText, key: string) {
  sharedRoot.removeAttribute(STORED_POSITION_PREFIX + key);
}

export function setStoredPosition(
  sharedRoot: XmlText,
  key: string,
  position: RelativePosition
) {
  sharedRoot.setAttribute(
    STORED_POSITION_PREFIX + key,
    encodeRelativePosition(position)
  );
}

function getAbsolutePositionsInTextRange(
  absolutePositions: Record<string, AbsolutePosition>,
  yTarget: XmlText,
  textRange?: TextRange
) {
  return Object.fromEntries(
    Object.entries(absolutePositions).filter(([, position]) => {
      if (position.type !== yTarget) {
        return false;
      }

      if (!textRange) {
        return true;
      }

      return position.assoc >= 0
        ? position.index >= textRange.start && position.index < textRange.end
        : position.index > textRange.start && position.index >= textRange.end;
    })
  );
}

function getAbsolutePositionsInYText(
  absolutePositions: Record<string, AbsolutePosition>,
  yText: XmlText,
  parentPath = ''
): Record<string, Record<string, AbsolutePosition>> {
  const positions = {
    [parentPath]: getAbsolutePositionsInTextRange(absolutePositions, yText),
  };

  const insertDelta = yTextToInsertDelta(yText);
  insertDelta.forEach(({ insert }, i) => {
    if (insert instanceof XmlText) {
      Object.assign(
        positions,
        getAbsolutePositionsInYText(
          absolutePositions,
          insert,
          parentPath ? `${parentPath}.${i}` : i.toString()
        )
      );
    }
  });

  return positions;
}

export function getStoredPositionsInDeltaAbsolute(
  sharedRoot: XmlText,
  yText: XmlText,
  delta: InsertDelta,
  deltaOffset = 0
) {
  const absolutePositions = getStoredPositionsAbsolute(sharedRoot);

  const positions = {
    '': getAbsolutePositionsInTextRange(absolutePositions, yText, {
      start: deltaOffset,
      end: deltaOffset + getInsertDeltaLength(delta),
    }),
  };

  delta.forEach(({ insert }, i) => {
    if (insert instanceof XmlText) {
      Object.assign(
        positions,
        getAbsolutePositionsInYText(absolutePositions, insert, i.toString())
      );
    }
  });

  return positions;
}

export function restoreStoredPositionsWithDeltaAbsolute(
  sharedRoot: XmlText,
  yText: XmlText,
  absolutePositions: Record<string, Record<string, AbsolutePosition>>,
  delta: InsertDelta,
  newDeltaOffset = 0,
  previousDeltaOffset = 0,
  path = ''
) {
  const toRestore = absolutePositions[path];

  if (toRestore) {
    Object.entries(toRestore).forEach(([key, position]) => {
      setStoredPosition(
        sharedRoot,
        key,
        createRelativePositionFromTypeIndex(
          yText,
          position.index - previousDeltaOffset + newDeltaOffset,
          position.assoc
        )
      );
    });
  }

  delta.forEach(({ insert }, i) => {
    if (insert instanceof XmlText) {
      restoreStoredPositionsWithDeltaAbsolute(
        sharedRoot,
        insert,
        absolutePositions,
        yTextToInsertDelta(insert),
        0,
        0,
        path ? `${path}.${i}` : i.toString()
      );
    }
  });
}

export function slateRangeToRelativeRange(
  sharedRoot: XmlText,
  slateRoot: Node,
  range: BaseRange
): RelativeRange {
  return {
    anchor: slatePointToRelativePosition(sharedRoot, slateRoot, range.anchor),
    focus: slatePointToRelativePosition(sharedRoot, slateRoot, range.focus),
  };
}

export function relativeRangeToSlateRange(
  sharedRoot: XmlText,
  slateRoot: Node,
  range: RelativeRange
): BaseRange | null {
  const anchor = relativePositionToSlatePoint(
    sharedRoot,
    slateRoot,
    range.anchor
  );

  if (!anchor) {
    return null;
  }

  const focus = relativePositionToSlatePoint(
    sharedRoot,
    slateRoot,
    range.focus
  );

  if (!focus) {
    return null;
  }

  return { anchor, focus };
}
