import { Method } from '../class/astMethods.js'
import { AST } from '../class/index.js'
import { BaseError } from '../lib/error.js'
import { Tokenizer } from '../types/ast.js'

new Method({
  name: 'SubExpression',
  run({ ast, index, tokens }) {
    const { loc } = tokens[index]
    const subExprTokens: Tokenizer[] = []
    let parenthesesCount = 1
    index++ // Pular o elemento '(' para que não fique em loop infinito
    ast.parseIndex++
    
    // Extrai todo que está dentro de ()
    while (index < tokens.length && parenthesesCount > 0) {
      const currentToken = tokens[index]
      if (currentToken.value === '(') {
        parenthesesCount++
      } else if (currentToken.value === ')') {
        parenthesesCount--
      } else if ((index + 1) === tokens.length) {
        return new BaseError({
          message: `It was expected that there would be a “)”, in row: ${currentToken.loc.start.line}, column: ${currentToken.loc.start.column}.`,
          code: 'WasExperienced',
          statusCode: 783,
          loc
        })
      }

      if (parenthesesCount > 0) {
        subExprTokens.push(currentToken)
      }
      index++
    }

    const body = ast.parse(subExprTokens, 0)
    if (AST.isError(body)) return body

    return {
      type: 'SubExpression',
      body: body,
      negatived: ast.getNegatived(tokens, index),
      loc: {
        start: loc.start,
        end: tokens[ast.parseIndex].loc.end
      }
    }
  },
})