#!/usr/bin/env node

import './index.js'
import { Terminal } from './lib/terminal.js'
import { Structure, Table, TableType } from './index.js'
import { AST } from './class/ast.js'

const args = process.argv.slice(2).map((arg) => arg.replace('--', ''))
const TableSettings: TableType = { type: 'csv', display: 'boolean' }
let filePath: string | undefined

new Terminal([
  {
    alias: ['-h'],
    command: 'help',
    description: 'Show all available arguments',
    rank: 0,
    async function() {
      console.log(Terminal.help())
      process.exit()
    },
  },
  {
    alias: ['-o'],
    command: 'output',
    description: 'File where the truth table will be saved',
    rank: 1,
    hasString: true,
    async function(content) {
      if (content) filePath = content 
    }
  },
  {
    alias: ['-d'],
    command: 'display',
    description: 'How the data will be displayed in the table, supports: boolean, number',
    rank: 1,
    hasString: true,
    async function(content) {
      if (!(content === 'number' || content === 'boolean')) throw new Error('Display command can only be “boolean” or “text”')
      Object.assign(TableSettings, { display: content } satisfies Partial<TableType>)
    }
  },
  {
    alias: ['-t'],
    command: 'type',
    description: 'Type of file the table will be saved in (csv | text)',
    rank: 1,
    hasString: true,
    async function(content) {
      if (!(content === 'csv' || content === 'txt')) throw new Error('Type command can only be csv or text')
      Object.assign(TableSettings, { type: content } satisfies Partial<TableType>)
    }
  },
  {
    alias: ['-p'],
    command: 'proposition',
    description: 'Define proposition to generate truth table',
    rank: 2,
    hasString: true,
    async function(content) {
      if (content === undefined) throw new Error('Preposition not defined!')

      const ast = (await new AST(content).loader()).parse()
      if(AST.isError(ast)) throw new Error(JSON.stringify(ast, null, 2))

      const structure = new Structure(ast).generate()
      if (filePath) {
        await new Table({ structure, ...TableSettings }).create(filePath)
      } else {
        console.log(structure)
      }
    },
  }
]).run(args)