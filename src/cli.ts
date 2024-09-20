#!/usr/bin/env node

import { basename } from 'path'
import { fileURLToPath } from 'url'
import packageJ from '../package.json'
import { AST } from './class/ast.js'
import './index.js'
import { Structure, Table, TableType } from './index.js'
import { Terminal } from './lib/terminal.js'

const args = process.argv.slice(2).map((arg) => arg.replace('--', ''))
const TableSettings: TableType = { type: 'csv', display: 'boolean' }
let filePath: string | undefined

// Verifica se o script está sendo executado diretamente
(() => {
  if (process.argv[1] !== fileURLToPath(import.meta.url) && !Object.keys(packageJ.bin).includes(basename(process.argv[1]))) return

  new Terminal([
    {
      alias: ['-h'],
      command: 'help',
      description: 'Show all available arguments',
      rank: 0,
      async function() {
        console.log(Terminal.help())
        process.exit()
      }
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
        if (!(content === 'number' || content === 'boolean')) throw new Error('Display command can only be “boolean” or number')
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
        if (!(content === 'csv' || content === 'markdown')) throw new Error('Type command can only be csv or text')
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
        if (content === undefined) throw new Error('Proposition not defined!')

        const ast = new AST(content).parse()
        if (AST.isError(ast)) throw new Error(JSON.stringify(ast, null, 2))

        const structure = new Structure(ast).generate()
        if (filePath) {
          await new Table({ structure, ...TableSettings }).create(filePath)
        } else {
          console.log(structure)
        }
      },
    }
  ]).run(args)
})()