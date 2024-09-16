import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { glob } from '../lib/glob.js'
import { Node } from '../types/ast.js'
import { MethodProps, MethodRunner } from '../types/method.js'

export class Method<ASType extends Node['type']>{
  static all: Method<Node['type']>[] = []
  static find (name: string) { return Method.all.find((method) => method.interaction.name === name)}
  
  constructor(public interaction: MethodProps<ASType>) {
    Method.all.push(this)
  }

  static async register () {
    const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'methods')
    const files = await glob(path)

    for (const module of files) {
      await import(module)
    }
  }

  static execute ({ ast, index, tokens, type }: MethodRunner & { type: Node['type'] }) {
    return Method.find(type)?.interaction.run({ ast, index, tokens })
  }
}