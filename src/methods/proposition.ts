import { Method } from '../class/astMethods.js'

new Method({
  name: 'Proposition',
  run({ ast, index, tokens }) {
    const { value, loc } = tokens[index]

    return {
      value: value,
      type: 'Proposition',
      negatived: ast.getNegatived(tokens, index),
      loc: {
        start: loc.start,
        end: loc.end
      }
    }
  },
})