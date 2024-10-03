import { lettersAllowed, operationsAllowed, subExpressions } from '..'
import { BaseError, UndeterminedError } from '../lib/error'
import { Tokenizer as TokenizerType } from '../types/tokenizer'

export class Tokenizer {
  public tokens: TokenizerType[] = []
  public exceptions: Array<BaseError> = []


  constructor(private input: string) {
    this.tokens = this.tokenilizer()
  }
  /**
   * Gera uma lista de tokens a partir de uma string de entrada (ou usa a string padrão da instância `this.input`),
   * dividida por linhas e colunas. Cada token inclui o valor e a sua localização na estrutura de entrada.
   *
   * @returns {TokenizerType[]} Uma lista de objetos `Tokenizer`, onde cada objeto representa um token com o valor e sua localização
   * (linha e coluna) na string de entrada.
   */
  private tokenilizer(): TokenizerType[] {
    const lines = this.input.split('\n')
    const tokens: TokenizerType[] = []

    for (let line = 0; line < lines.length; line++) {
      const values = lines[line].split('')
  
      for (let column = 0; column < values.length; column++) {
        const token = values[column]
    
        if (['', ' '].includes(token)) continue

        tokens.push({
          value: token,
          loc: {
            start: {
              line,
              column,
            },
            end: {
              line,
              column
            },
          },
        })
      }
    }

    this.validation()

    return tokens
  }

  /**
   * Valida a lista de tokens para garantir que cada valor seja permitido.
   * Se algum token contiver um valor não permitido, lança um erro especificando a linha e a coluna do valor inválido.
   *
   */
  private validation (): void {
    for (let index = 0; index < this.tokens.length; index++) {
      const token = this.tokens[index]
  
      if (![lettersAllowed, operationsAllowed, subExpressions].flat().includes(token.value)) {
        this.exceptions.push(new UndeterminedError({ value: token.value, loc: token.loc }))
      }
    }
  }
}