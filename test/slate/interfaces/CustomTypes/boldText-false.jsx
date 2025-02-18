import { isBoldText } from './type-guards'

export const input = {
  placeholder: 'heading',
  bold: false,
  italic: false,
  text: 'mytext',
}

export const test = isBoldText

export const output = false
