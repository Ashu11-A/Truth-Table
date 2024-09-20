import { AST } from './class/ast.js'
import { Structure } from './class/structure.js'
import { Table } from './class/table.js'

const input = 'p ^ (p v ~q)'
const parser = new AST(input) // Loader must be initialized at least once, before any parse interaction
const ast = parser.parse()

if (AST.isError(ast)) throw new Error(JSON.stringify(ast, null, 2))
await parser.save('ast.json')

const structure = new Structure(ast).generate()
await structure.save('structure.json')

const table = new Table({
  structure,
  display: 'boolean',
  // type: 'csv'
})

// const content = table.csv()
// const content = table.markdown()

table.type = 'markdown'
await table.create('table.md')

table.type = 'csv'
await table.create('table.csv')