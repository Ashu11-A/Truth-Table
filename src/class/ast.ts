import { biconditionalExpressions, conditionalExpressions, conjunctionExpressions, disjunctionExpressions, lettersAllowed, negationExpressions, operationsAllowed, subExpressions, xorExpressions } from '@/index.js'
import { Node, OperationKey, OperationValues, Tokanizer } from '@/types/ast.js'
import { writeFile } from 'fs/promises'
import { ErrorType, UnexpectedError } from './error.js'

export class AST {
  public readonly tokens: Tokanizer [] = []
  public ast: Node[] | undefined
  constructor(public input: string) {
    this.tokens = this.tokenize(this.input)
  }
  
  /**
   * Analisa os tokens gerados pela função `tokenize`, valida-os e constrói a AST (Abstract Syntax Tree) com base nos tokens válidos.
   * Os tokens são categorizados como 'Proposition' (para letras), 'Operation' (para operadores) ou 'SubExpression' (para conjuntos).
   * A AST resultante é um array de nós, onde cada nó contém o valor, tipo, e a posição do token.
   * 
   * @returns {Node[]} Retorna a AST gerada
   * 
   * @throws {Error} Se houver tokens inválidos, a função `validation` irá lançar um erro com a linha e a coluna do token inválido.
   */
  parse(tokens?: Tokanizer[]): Node[] | ErrorType {
    tokens = tokens ?? this.tokens
    this.validation(tokens)

    const process = (tokens: Tokanizer[]): Node[] => {
      const ast: Node[] = []
      let index = 0

      while (index < tokens.length) {
        const { value, loc } = tokens[index]

        switch (true) {
        case lettersAllowed.includes(value): {
          ast.push({
            value: value,
            type: 'Proposition',
            negatived: this.getNegatived(tokens, index),
            loc: {
              start: loc.start,
              end: loc.end
            }
          })
          index++
          break
        }
        case operationsAllowed.includes(value): {
          /**
           * Caso seja uma negativa de uma Preposição, ele deve ser pulado,
           * já que ele será anexado a Preposição com o elemento negatived
           */
          if (negationExpressions.includes(value)) {
            index++
            continue
          }
          ast.push({
            type: 'Operation',
            value,
            key: this.getOperationKey(value as OperationValues),
            loc: {
              start: loc.start,
              end: loc.end
            }
          })
          index++
          break
        }
        case value === '(': {
          const indexSet = index
          const subExprTokens: Tokanizer[] = []
          let parenthesesCount = 1
          index++ // Pular o elemento '(' para que não fique em loop infinito
          
          // Extrai todo que está dentro de ()
          while (index < tokens.length && parenthesesCount > 0) {
            const currentToken = tokens[index]
            if (currentToken.value === '(') {
              parenthesesCount++
            } else if (currentToken.value === ')') {
              parenthesesCount--
            } else if ((index + 1) === tokens.length) {
              throw new Error(`It was expected that there would be a “)”, in row: ${currentToken.loc.start.line}, column: ${currentToken.loc.start.column}.`)
            }

            if (parenthesesCount > 0) {
              subExprTokens.push(currentToken)
            }
            index++
          }

          ast.push({
            type: 'SubExpression',
            body: process(subExprTokens),
            negatived: this.getNegatived(tokens, indexSet),
            loc: {
              start: loc.start,
              end: tokens[index - 1].loc.end // End of the closing parenthesis
            }
          })
          break
        }
        default: {
          throw new Error(`In the row: ${loc.start.line} Column: ${loc.start.column} It was not possible to determine what the value would be: ${value}`)
        }
        }
      }
      return ast
    }
    const ast = process(tokens)
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

  getNegatived (tokens: Tokanizer[], index: number) {
    return negationExpressions.includes(tokens[index - 1]?.value)
  }

  /**
   * Gera uma lista de tokens a partir de uma string de entrada (ou usa a string padrão da instância `this.input`),
   * dividida por linhas e colunas. Cada token inclui o valor e a sua localização na estrutura de entrada.
   *
   * @param {?string} [input]  string de entrada contendo a expressão ou dados a serem tokenizados. Se não for fornecida,
   * a função usará o valor de `this.input` como entrada.
   * 
   * @returns {Tokanizer[]} Uma lista de objetos `Tokenizer`, onde cada objeto representa um token com o valor e sua localização
   * (linha e coluna) na string de entrada.
   */
  tokenize(input?: string): Tokanizer[] {
    const lines = (input ?? this.input).split('\n')
    const tokens: Tokanizer[] = []

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
    * 
    * @throws {Error} Se algum valor no token não estiver na lista de caracteres permitidos, 
    * lança um erro detalhando a linha e a coluna do valor inválido.
    * 
    */
  validation(tokens: Tokanizer[]): void {
    for (const { loc, value } of tokens) {
      if (![...lettersAllowed, ...operationsAllowed, ...subExpressions].includes(value)) {
        throw new Error(`In the row: ${loc.start.line} Column: ${loc.start.column} It was not possible to determine what the value would be: ${value}`)
      }
    }
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
    if (this.ast === undefined) throw new Error('AST is undefined, use the parse function before save!')
    await writeFile(path, JSON.stringify(this.ast, null, 2))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isUnexpectedError(object: any): object is ErrorType {
    return object['code'] === 'Unexpected'
  }
}