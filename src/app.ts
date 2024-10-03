import { Analyzer, isError } from './class/Analyzer.js'
import { Structure } from './class/structure.js'
import { Table } from './class/table.js'

console.time()
// const input = '(x ˅ (x ^ y ^ z) ˅ (y ^ z ^ x) ˅ (w ^ x) ˅ (w ^ x) ˅ (x ^ w))'
const input = '(p ^ ~q) ^ (p ˅ q ^ (q ^ c))'
const parser = new Analyzer({ input }) // Loader must be initialized at least once, before any parse interaction
const ast = parser.parse()

if (isError(ast)) throw new Error(JSON.stringify(ast, null, 2))

await parser.save('ast.json')

const structure = new Structure(parser.ast)
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

console.timeEnd()
