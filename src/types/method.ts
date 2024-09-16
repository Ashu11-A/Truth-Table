import { AST } from '../class/ast.js'
import { ErrorType } from '../lib/error.js'
import { Node, Tokenizer } from './ast.js'

export type MethodRunner = {
  ast: AST,
  tokens: Tokenizer[],
  index: number
}

export type MethodTypes<Type> = {
  name: Type
  run: ({ ast, tokens, index }: MethodRunner) => Node | ErrorType
}

export type MethodProps<ASType extends Node['type']> = MethodTypes<ASType>