import { AST } from './class/ast.js'

const input = 'p ^ (q ^ j ^ (r ^ h))'
const ast = new AST(input).parse()
console.log(ast)
// const structure = new Structure({ input }).generate()
// new Table({ structure, type: 'csv', display: 'boolean' }).create('table.csv')