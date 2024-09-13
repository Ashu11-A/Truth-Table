import { TerminalArg } from '@/types/terminal.js'

export class Terminal {
  static args: TerminalArg[] = []
  constructor(args: TerminalArg[]) {
    Terminal.args = args
  }

  validate(input: string[]) {
    for (const arg of input.filter((arg) => arg.includes('-'))) {
      const allArgs = Terminal.args.flatMap(({ command, alias }) => [command, ...alias.map((alia) => alia || command)])
      if (!allArgs.includes(arg)) throw new Error(`Not found arg ${arg}, try --help`)
    }
  }

  formatAliasToCommand(input: string[]): TerminalArg[] {
    const newArgs: Array<TerminalArg> = []

    for (let argIndex = 0; argIndex < input.length; argIndex++) {
      for (const arg of Terminal.args) {
        if (arg.alias.includes(input[argIndex]) || input[argIndex] === arg.command) {
          if (arg?.hasString) {
            // caso a proxima arg seja não seja uma strings, e sim uma arg
            if (input[argIndex + 1]?.startsWith('-')) {
              newArgs.push(arg)
              continue
            }
            ++argIndex
            newArgs.push({ ...arg, string: input[argIndex] })
            continue
          }
          newArgs.push(arg)
          continue
        }
      }
    }

    return newArgs
  }

  quickSort (args: TerminalArg[]): TerminalArg[] {
    return args.sort((A, B) => A.rank - B.rank)
  }

  static help () {
    const output: string[] = []
    output.push('Usage: ttt [options]\n')
    output.push('  Options:\n')

    const maxAliasLength = Math.max(...Terminal.args.map(arg => arg.alias.join(', ').length))
    const maxCommandLength = Math.max(...Terminal.args.map(arg => `--${arg.command}`.length))

    for (const arg of Terminal.args) {
      const alias = arg.alias.join(', ')
      const command = `--${arg.command}`
      const aliasPadding = ' '.repeat(maxAliasLength - alias.length)
      const commandPadding = ' '.repeat(maxCommandLength - command.length)

      output.push(`   ${alias}${aliasPadding} ${command}${commandPadding} ${arg.description}`)
    }
    return output.join('\n')
  }

  async run(input: string[]) {
    this.validate(input)

    const args = this.quickSort(this.formatAliasToCommand(input))
    if (args.length === 0) {
      console.log(Terminal.help())
      return
    }
    for (const arg of args) {
      await arg.function(arg.string)
    }
  }
}