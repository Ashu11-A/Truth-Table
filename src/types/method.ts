import { Analyzer } from '../class/Analyzer.js'
import { ErrorType } from '../lib/error.js'
import { Node, Tokenizer } from './analyzer.js'

export type MethodRunner = {
  ast: Analyzer,
  tokens: Tokenizer[],
  index: number
}

export type MethodTypes<Type> = {
  name: Type
  run: ({ ast, tokens, index }: MethodRunner) => Node | ErrorType
}

export type MethodProps<ASType extends Node['type']> = MethodTypes<ASType>