import { jest } from '@jest/globals'
import { Analyzer, isError, Node, Structure } from '../src'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'
jest.useFakeTimers()

describe('StructureGenerate', () => {
  it('Testing table structure generation (p ^ ~q)', async () => {
    const parser = new Analyzer('p ^ ~q')

    const result = parser.parse()
    expect(isError(result)).toBe(false)
    
    const nodes = result as Node[]
    const structure = new Structure(nodes).generate()
    console.log(structure.structure)
    console.log(structure.structure.length)
    
    
    expect(structure.propositions).toHaveLength(4)
    expect(structure.columns).toBe(4)
    expect(structure.rows).toBe(4)
    expect(structure.structure).toHaveLength(16)

    expect(structure.structure[0].value).toBe(true)
    expect(structure.structure[1].value).toBe(true)
    expect(structure.structure[2].value).toBe(false)
    expect(structure.structure[3].value).toBe(false)
  })

  it('Testing the generation of a more complex table structure (p ^ ~(q ˅ r))', async () => {
    const parser = new Analyzer('p ^ ~(q ˅ r)')

    const result = parser.parse()
    expect(isError(result)).toBe(false)

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