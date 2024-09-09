import { lettersAllowed, operationsAllowed, subExpressions } from '@/index.js'
import { Node, OperationKey, Tokanizer } from '@/types/ast.js'

export class AST {
  public readonly tokens: Tokanizer [] = []
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
  parse(tokens?: Tokanizer[]): Node[] {
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
            loc: {
              start: loc.start,
              end: loc.end
            }
          })
          index++
          break
        }
        case operationsAllowed.includes(value): {
          const key = ['¬', '~'].includes(value)
            ? OperationKey.Negation
            : ['∧','^'].includes(value)
              ? OperationKey.Conjunction
              : ['∨'].includes(value)
                ? OperationKey.Disjunction
                : ['→'].includes(value)
                  ? OperationKey.Conditional
                  : ['↔'].includes(value)
                    ? OperationKey.Biconditional
                    : OperationKey.None

          ast.push({
            type: 'Operation',
            value,
            key,
            loc: {
              start: loc.start,
              end: loc.end
            }
          })
          index++
          break
        }
        case value === '(': {
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
            }

            if (parenthesesCount > 0) {
              subExprTokens.push(currentToken)
            }
            index++
          }

          ast.push({
            type: 'SubExpression',
            body: process(subExprTokens),
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
    this.validationAST(ast)
    return ast
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
    * @throws {Error} Se algum valor no token não estiver na lista de caracteres permitidos (`lettersAllowed`, '~', '^', '˅', '→', '↔'), 
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

  validationAST(ast: Node[]): void {
    const process = (expressions: Node[]): void => {
      let index = 0

      while (index < expressions.length) {
        const element = expressions[index]
        const nextElement = expressions[index + 1]

        switch (element.type) {
        case 'Proposition': {
          if (nextElement !== undefined && nextElement?.type !== 'Operation') throw new Error(`The next element was expected to be an Operation, but it got one: ${nextElement.type}`)
          index++

          break
        }
        case 'Operation': {
          if (nextElement !== undefined && !['Proposition', 'SubExpression'].includes(nextElement?.type)) throw new Error(`The next element was expected to be a Proposition or SubExpression, but it got one: ${nextElement.type}`)
          index++
          
          break
        }
        case 'SubExpression': {
          process(element.body)
          if (nextElement !== undefined && !['Operation'].includes(nextElement?.type)) throw new Error(`The next element was expected to be an Operation, but it got one: ${nextElement?.type}`)
          index++

          break
        }
        }

      }
    }
    process(ast)
  }
}