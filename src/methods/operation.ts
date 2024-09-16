import { Method } from '../class/astMethods.js'
import { OperationValues } from '../types/ast.js'

new Method({
  name: 'Operation',
  run({ ast, index, tokens }) {
    const { value, loc } = tokens[index]

    return {
      type: 'Operation',
      value,
      key: ast.getOperationKey(value as OperationValues),
      loc: {
        start: loc.start,
        end: loc.end
      }
    }
  },
})