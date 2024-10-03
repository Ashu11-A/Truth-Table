import { Method } from '../class/Methods.js'
import { OperationValues } from '../types/analyzer.js'

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