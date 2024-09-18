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
      for (const type of ['csv', 'txt']) {
        const table = new Table({ structure, type: type as 'csv' | 'txt', display: display as 'number' | 'boolean' })
    
        await table.create(`table.${type}`)
      }
    }

    expect((await stat('table.csv')).isFile()).toBe(true)
  })

  afterAll(async () => {
    await rm('table.csv')
  })
})