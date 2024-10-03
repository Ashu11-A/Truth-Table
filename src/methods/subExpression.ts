import { Method } from '../class/Methods.js'
import { Analyzer, isError } from '../class/index.js'
import { BaseError } from '../lib/error.js'
import { Tokenizer } from '../types/tokenizer.js'

new Method({
  name: 'SubExpression',
  run({ ast, index, tokens }) {
    const { loc } = tokens[index]
    const subExprTokens: Tokenizer[] = []
    let parenthesesCount = 1
    index++ // Pular o elemento '(' para que não fique em loop infinito

    // Extrai todo que está dentro de ()
    while (index < tokens.length && parenthesesCount > 0) {
      const currentToken = tokens[index]

      switch (true) {
      case (currentToken.value === '('): {
        parenthesesCount++
        break
      }
      case (currentToken.value === ')'): {
        parenthesesCount--
        break
      }
      case ((index + 1) === tokens.length): {
        return new BaseError({
          message: `It was expected that there would be a “)”, in row: ${currentToken.loc.start.line}, column: ${currentToken.loc.start.column}.`,
          code: 'WasExperienced',
          statusCode: 783,
          loc,
        })
      }
      }

      // && (index + 1) < tokens.length será usado apra ignorar casos em que a expressão é assim:
      // ((p ^ q) v (p ^ q)) <- ignora o ultimo )
      if (parenthesesCount > 0 && (index + 1) < tokens.length) subExprTokens.push(currentToken)
      index++
    }

    const body = new Analyzer({ tokenizer: { tokens: subExprTokens, exceptions: [] } }).parse(subExprTokens, 0)
    if (isError(body)) return body

    return {
      type: 'SubExpression',
      body: body,
      negatived: ast.getNegatived(tokens, index),
      loc: {
        start: loc.start,
        end: tokens[index - 1].loc.end,
      },
    }
  },
})
