import { jest } from '@jest/globals'
import { existsSync } from 'fs'
import { rm } from 'fs/promises'
import { Node, SubExpression } from '../src'
import { Analyzer, isError } from '../src/class/ast'

jest.useFakeTimers()

describe('ASTGenerate', () => {
  const isProposition = (node: Node, value: string) =>
    node.type === 'Proposition' && node.value === value
  
  const isOperation = (node: Node, value: string) =>
    node.type === 'Operation' && node.value === value
  
  const isSubExpression = (node: SubExpression) => node.type === 'SubExpression'

  const validateASTStructure = (nodes: Node[], expectedLength: number, validationCallback: (nodes: Node[]) => void) => {
    expect(nodes).toHaveLength(expectedLength)
    validationCallback(nodes)
  }

  const parseExpression = async (expression: string) => {
    const parser = new Analyzer(expression)
    return parser.parse()
  }

  it('Test with simple expression (p ^ q)', async () => {
    const result = await parseExpression('p ^ q')
    
    expect(isError(result)).toBe(false)

    const nodes = result as Node[]

    validateASTStructure(nodes, 3, (nodes) => {
      expect(isProposition(nodes[0], 'p')).toBe(true)
      expect(isOperation(nodes[1], '^')).toBe(true)
      expect(isProposition(nodes[2], 'q')).toBe(true)
    })
  })

  it('Complex test using SubExpression (p ^ (q ˅ r) → l ↔ y ⊕ o)', async () => {
    const result = await parseExpression('p ^ (q ˅ r) → l ↔ y ⊕ o')
    
    expect(isError(result)).toBe(false)

    const nodes = result as Node[]

    validateASTStructure(nodes, 9, (nodes) => {
      expect(isProposition(nodes[0], 'p')).toBe(true)
      expect(isOperation(nodes[1], '^')).toBe(true)

      const subExpressionNode = nodes[2] as SubExpression
      expect(isSubExpression(subExpressionNode)).toBe(true)

      const subNodes = subExpressionNode.body
      validateASTStructure(subNodes, 3, (subNodes) => {
        expect(isProposition(subNodes[0], 'q')).toBe(true)
        expect(isOperation(subNodes[1], '˅')).toBe(true)
        expect(isProposition(subNodes[2], 'r')).toBe(true)
      })

      expect(isOperation(nodes[3], '→')).toBe(true)
      expect(isProposition(nodes[4], 'l')).toBe(true)
      expect(isOperation(nodes[5], '↔')).toBe(true)
      expect(isProposition(nodes[6], 'y')).toBe(true)
      expect(isOperation(nodes[7], '⊕')).toBe(true)
      expect(isProposition(nodes[8], 'o')).toBe(true)
    })
  })

  const errorTestCases = [
    { expression: 'p ^', description: 'Test UnexpectedError (p ^)' },
    { expression: 'p q', description: 'Test UnexpectedError (p q)' },
    { expression: 'p ^ q)', description: 'Test UnexpectedError (p ^ p))' },
    { expression: 'p ^ ^)', description: 'Test UnexpectedError (p ^ ^)' },
    { expression: 'q ^ (p ^ p) p)', description: 'Test UnexpectedError (q ^ (p ^ p) p)' },
    { expression: 'q ^ =', description: 'Test letters not allow' }
  ]

  errorTestCases.forEach(({ expression, description }) => {
    it(description, async () => {
      const result = await parseExpression(expression)
      expect(isError(result)).toBe(true)
    })
  })

  it('Save Analyzer', async () => {
    const parser = new Analyzer('p ^ ~q')

    /**
     * Casa haja uma tentativa de salvar antes do momento de processamento,
     * lance uma exeção
     */
    expect(() => parser.save('ast.json')).rejects.toThrow(Error)

    const result = parser.parse()
    expect(isError(result)).toBe(false)

    await parser.save('ast.json')
    expect(existsSync('ast.json')).toBe(true)
  })
  afterAll(async () => {
    await rm('ast.json')
  })
})
