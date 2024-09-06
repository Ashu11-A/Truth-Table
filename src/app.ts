import { Structure } from './class/structure.js'
import { Table } from './class/table.js'

const input = 'p ^ q ^ j'
const structure = new Structure({ input }).generate()
new Table({ structure, type: 'csv', display: 'boolean' }).create('table.csv')