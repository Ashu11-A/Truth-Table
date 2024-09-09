import { StructureJson, StructureType } from '@/types/structure.js'
import { writeFile } from 'fs/promises'

/**
 * Represents a logical structure that can parse input expressions
 * and generate corresponding values for a truth table.
 *
 * @export
 * @class Structure
 * @typedef {Structure}
 */
export class Structure {
  /**
   * The input expression for the structure, which is a string of variables.
   */
  public readonly input: string

  /**
   * The list of unique variables extracted from the input expression.
   * 
   * @type {string[]}
   */
  public variables: string[] = []

  /**
   * The list of values representing the truth table, including the elements,
   * values (true/false), and their positions in the table.
   * 
   * @type {StructureJson}
   */
  public values: StructureJson = []

  constructor({ input }: StructureType) {
    this.input = input
  }

  /**
   * Parses the input expression to extract variables and generate the truth table values.
   * 
   * @returns {Structure} The current instance of the Structure class with parsed values.
   */
  generate(): Structure {
    const letters = 'abcdefghijklmnopqrsuvwxyz'.split('')
    const expressions = this.input.split('')
    for (const expression of expressions) {
      if (letters.includes(expression) && !this.variables.includes(expression)) {
        this.variables.push(expression)
      }
    }

    const columns = this.variables.length
    const rows = 2**columns   
    
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        this.values.push({
          element: this.variables[column],
          value: !this.getTruthValue(row, column, columns),
          column,
          row,
          position: `${row}x${column}`
        })
      }
    }
    return this
  }

  /**
   * Determines the truth value for a given row and column in the truth table.
   * 
   * @param {number} row - The current row index in the truth table.
   * @param {number} column - The current column index in the truth table.
   * @param {number} totalColumns - The total number of columns in the truth table.
   * @returns {boolean} The truth value for the specified row and column.
   */
  getTruthValue(row: number, column: number, totalColumns: number): boolean {
    // Calcular o número total de combinações (2^column), para determinar quando alternar entre true/false
    const alternatingFactor = 2 ** (totalColumns - column - 1)
    
    // Se a linha atual estiver dentro do grupo "true" para essa variável, retorna true
    // Caso contrário, retorna false
    return Math.floor(row / alternatingFactor) % 2 === 1
  }
}
