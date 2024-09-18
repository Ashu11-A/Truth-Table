import { jest } from '@jest/globals'
import { AST, Node, Structure } from '../src'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'
jest.useFakeTimers()

describe('StructureGenerate', () => {
  it('Testing table structure generation (p ^ q)', async () => {
    const parser = new AST('p ^ q')
    await parser.loader()

    const result = parser.parse()
    expect(AST.isError(result)).toBe(false)

    const nodes = result as Node[]

    const structure = new Structure(nodes).generate()

    expect(structure.propositions).toHaveLength(3)
    expect(structure.columns).toBe(3)
    expect(structure.rows).toBe(4)
    expect(structure.structure).toHaveLength(12)
  })

  it('Testing the generation of a more complex table structure (p ^ ~(q ˅ r))', async () => {
    const parser = new AST('p ^ ~(q ˅ r)')
    await parser.loader()

    const result = parser.parse()
    expect(AST.isError(result)).toBe(false)

    const nodes = result as Node[]

    const structure = new Structure(nodes).generate()

    expect(structure.propositions).toHaveLength(5)
    expect(structure.columns).toBe(5)
    expect(structure.rows).toBe(8)
    expect(structure.structure).toHaveLength(40)

    expect(structure.structure)

    await structure.save('structure.json')
    expect(existsSync('structure.json')).toBe(true)
  })

  afterAll(async () => {
    await rm('structure.json')
  })
})