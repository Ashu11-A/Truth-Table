import { writeFile } from 'fs/promises'
import { biconditionalExpressions, conditionalExpressions, conjunctionExpressions, disjunctionExpressions, lettersAllowed, negationExpressions, operationsAllowed, subExpressions, xorExpressions } from '../index.js'
import { ErrorType, NotInstantiatedError, UndeterminedError, UnexpectedError } from '../lib/error.js'
import { Node, OperationKey, OperationValues, Tokenizer } from '../types/ast.js'
import { Method } from './astMethods.js'

export class AST {
  public readonly tokens: Tokenizer [] = []
  public ast: Node[] | undefined
  public parseIndex = 0

  constructor(public input: string) {
    this.tokens = this.tokenize(this.input)
  }

  async loader(): Promise<AST> {
    await Method.register()
    return this
  }
  
  /**
   * Analisa os tokens gerados pela função `tokenize`, valida-os e constrói a AST (Abstract Syntax Tree) com base nos tokens válidos.
   * Os tokens são categorizados como 'Proposition' (para letras), 'Operation' (para operadores) ou 'SubExpression' (para conjuntos).
   * A AST resultante é um array de nós, onde cada nó contém o valor, tipo, e a posição do token.
   * 
   * @returns {Node[]} Retorna a AST gerada
   */
  parse(tokens?: Tokenizer[], index?: number): Node[] | ErrorType {
    tokens = tokens ?? this.tokens
    let actualIndex = index ?? this.parseIndex
    const ast: Node[] = []
    const err = this.validation(tokens)
    if (err !== undefined) return err


    while (actualIndex < tokens.length) {
      const { value, loc } = tokens[actualIndex]

      switch (true) {
      case lettersAllowed.includes(value): {
        const result = Method?.execute?.({ type: 'Proposition', ast: this, index: actualIndex, tokens })
        if (result === undefined) return new NotInstantiatedError({ method: 'Proposition', loc })
        if (AST.isError(result)) return result

        ast.push(result)
        actualIndex++
        this.parseIndex++
        break
      }
      case operationsAllowed.includes(value): {
        // Caso seja uma negativa de uma Preposição, ele deve ser pulado,
        // já que ele será anexado à Preposição com o elemento negado
        if (negationExpressions.includes(value)) {
          actualIndex++
          this.parseIndex++
          continue
        }
        const result = Method?.execute?.({ type: 'Operation', ast: this, index: actualIndex, tokens })
        if (result === undefined) return new NotInstantiatedError({ method: 'Operation', loc })
        if (AST.isError(result)) return result

        ast.push(result)
        actualIndex++
        this.parseIndex++
        break
      }
      case value === '(': {
        const result = Method?.execute?.({ type: 'SubExpression', ast: this, index: actualIndex, tokens })
        if (result === undefined) return new NotInstantiatedError({ method: 'SubExpression', loc })
        if (AST.isError(result)) return result

        ast.push(result)
        actualIndex = ++this.parseIndex
        break
      }
      default: {
        return new UndeterminedError({ value, loc })
      }
      }
    }

    const error = this.validationAST(ast)
    if (error !== undefined) return error

    this.ast = ast
    return ast
  }

  getOperationKey (value: OperationValues): OperationKey {
    return negationExpressions.includes(value)
      ? OperationKey.Negation
      : conjunctionExpressions.includes(value)
        ? OperationKey.Conjunction
        : disjunctionExpressions.includes(value)
          ? OperationKey.Disjunction
          : conditionalExpressions.includes(value)
            ? OperationKey.Conditional
            : biconditionalExpressions.includes(value)
              ? OperationKey.Biconditional
              : xorExpressions.includes(value)
                ? OperationKey.XOR
                : OperationKey.None
  }

  getNegatived (tokens: Tokenizer[], index: number) {
    return negationExpressions.includes(tokens[index - 1]?.value)
  }

  /**
   * Gera uma lista de tokens a partir de uma string de entrada (ou usa a string padrão da instância `this.input`),
   * dividida por linhas e colunas. Cada token inclui o valor e a sua localização na estrutura de entrada.
   *
   * @param {?string} [input]  string de entrada contendo a expressão ou dados a serem tokenizados. Se não for fornecida,
   * a função usará o valor de `this.input` como entrada.
   * 
   * @returns {Tokenizer[]} Uma lista de objetos `Tokenizer`, onde cada objeto representa um token com o valor e sua localização
   * (linha e coluna) na string de entrada.
   */
  tokenize(input?: string): Tokenizer[] {
    const lines = (input ?? this.input).split('\n')
    const tokens: Tokenizer[] = []

    for (const [line, content] of Object.entries(lines)) {
      const lineNumber = Number(line) + 1
      const values = content.split('')

      for (const [index, token] of Object.entries(values)) {
        if (['', ' '].includes(token)) continue

        tokens.push({
          value: token,
          loc: {
            start: {
              line: lineNumber,
              column: Number(index)
            },
            end: {
              line: lineNumber,
              column: Number(index)
            }
          }
        })
      }
    }

    return tokens
  }

  /**
    * Valida a lista de tokens para garantir que cada valor seja permitido. 
    * Se algum token contiver um valor não permitido, lança um erro especificando a linha e a coluna do valor inválido.
    *
    * @param {Tokenizer[]} tokens - Uma lista de tokens a serem validados, onde cada token contém o valor e sua localização.
    */
  validation(tokens: Tokenizer[]): ErrorType | undefined {
    for (const { loc, value } of tokens) {
      if (![lettersAllowed, operationsAllowed, subExpressions].flat().includes(value)) {
        return new UndeterminedError({ value, loc })
      }
    }
    return
  }

  validationAST(ast: Node[]): ErrorType | undefined {
    const process = (expressions: Node[]): ErrorType | undefined => {
      let index = 0

      while (index < expressions.length) {
        const element = expressions[index]
        const nextElement = expressions[index + 1]

        switch (element.type) {
        case 'Proposition': {
          if (nextElement !== undefined && nextElement?.type !== 'Operation') return new UnexpectedError({
            origin: element.type,
            expected: ['Operation'],
            unexpected: nextElement.type,
            loc: nextElement.loc
          }).toJSON()
          index++

          break
        }
        case 'Operation': {
          /**
           * Só ocorre quando se é usado um elemento não permidido, tipo uma caracter especial ou letra não categorizada
           * Error: P ^ =
           * Correct: P ^ Q
           */
          if (element.key === 'None') return new UnexpectedError({
            origin: element.key,
            expected: ['Proposition', 'SubExpression'],
            unexpected: nextElement.type,
            loc: nextElement.loc
          }).toJSON()

          /**
           * Se após um elemento Operation não for um dos elementos Proposition ou SubExpression
           * Error: P ^ ^
           * Correct: P ^ Q
           */
          if (nextElement !== undefined && !['Proposition', 'SubExpression'].includes(nextElement?.type)) return new UnexpectedError({
            origin: nextElement.type,
            expected: ['Proposition', 'SubExpression'],
            unexpected: nextElement.type,
            loc: nextElement.loc
          }).toJSON()

          /**
           * Caso após um elemento Operation não houver nenhum outro elemento
           * Error: P ^ Q ^
           * Correct: P ^ Q ^ R
           */
          if (nextElement === undefined) return new UnexpectedError({
            origin: element.type,
            expected: ['Proposition', 'SubExpression'],
            unexpected: 'None',
            loc: element.loc
          }).toJSON()

          index++
          
          break
        }
        case 'SubExpression': {
          process(element.body)
          /**
           * Se após a declaração de um conjunto, houver algo, isso deve ser um operador.
           * Error: (P ^ Q) P
           * Correct: (P ^ Q) ^ P
           */
          if (nextElement !== undefined && !['Operation'].includes(nextElement?.type)) return new UnexpectedError({
            origin: element.type,
            expected: ['Operation'],
            unexpected: nextElement.type,
            loc: nextElement.loc
          }).toJSON()
          index++

          break
        }
        }
      }
      return
    }
    return process(ast)
  }

  /**
   * Saves the current AST to a file in JSON format.
   * 
   * @async
   * @param {string} path - The path to the file where the JSON content will be saved.
   * @returns {Promise<void>} A promise that resolves when the file has been successfully saved.
   */
  async save(path: string): Promise<void> {
    if (this.ast === undefined) throw new Error('AST is undefined, use the parser function before saving, or an error occurred while parsing.')
    await writeFile(path, JSON.stringify(this.ast, null, 2))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isError(object: any): object is ErrorType {
    return ['Unexpected', 'NotInstantiated', 'Undetermined', 'WasExperienced'].includes(object?.['code'])
  }
}