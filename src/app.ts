import { AST } from './class/ast.js'
import { Structure } from './class/structure.js'
import { Table } from './class/table.js'

const input = 'p ^ q'
const parser = new AST(input)
const ast = parser.parse()
await parser.save('ast.json')

if (AST.isUnexpectedError(ast)) throw new Error(JSON.stringify(ast, null, 2))

const structure = new Structure(ast).generate()
await structure.save('structure.json')

new Table({
  structure,
  type: 'csv',
  display: 'boolean'
}).create('table.csv')