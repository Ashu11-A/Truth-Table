import { jest } from '@jest/globals'
import { rm, stat } from 'fs/promises'
import { AST, Node, Structure, Table } from '../src'

jest.useFakeTimers()

describe('TableGenetate', () => {
  it('Save Table', async () => {
    const parser = new AST('p ^ q')
    await parser.loader()

    const result = parser.parse()
    expect(AST.isError(result)).toBe(false)

    const nodes = result as Node[]
    const structure = new Structure(nodes).generate()

    for (const display of ['boolean', 'number']) {
      for (const type of ['csv', 'markdown']) {
        const table = new Table({ structure, display: display as 'number' | 'boolean' })
  
        switch (type as 'csv' | 'markdown') {
        case 'csv': {
          table.type = 'csv'
          await table.create('table.csv')
          break
        }
        case 'markdown': {
          table.type = 'markdown'
          await table.create('table.md')
          break
        }
        }
      }
    }

    expect((await stat('table.csv')).isFile()).toBe(true)
    expect((await stat('table.md')).isFile()).toBe(true)
  })

  afterAll(async () => {
    await rm('table.csv')
    await rm('table.md')
  })
})