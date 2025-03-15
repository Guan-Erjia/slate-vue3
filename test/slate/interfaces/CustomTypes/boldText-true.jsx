// show that regular methods that are imported work as expected
import { isBoldText } from './type-guards'

export const input = {
  bold: true,
  text: 'mytext',
}

export const test = isBoldText

export const output = true
